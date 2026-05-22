# Jacked in June 2026 — local submission server (PowerShell, no Node required)
# Usage: powershell -File server\server.ps1
#        or double-click start-server.bat

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$WorkbookPath = 'C:\Users\gary.ghag\OneDrive - IMW Industries Ltd\Jacked in June 2026\jij-2026-submissions.xlsx'
$Port = 3000

$Mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.json' = 'application/json'
  '.md'   = 'text/markdown; charset=utf-8'
}

function Write-HttpResponse($context, $statusCode, $contentType, $bodyBytes) {
  $response = $context.Response
  $response.StatusCode = $statusCode
  $response.ContentType = $contentType
  $response.ContentLength64 = $bodyBytes.Length
  $response.OutputStream.Write($bodyBytes, 0, $bodyBytes.Length)
  $response.OutputStream.Close()
}

function Write-JsonResponse($context, $statusCode, $obj) {
  $json = ($obj | ConvertTo-Json -Compress)
  Write-HttpResponse $context $statusCode 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes($json))
}

function Add-EntriesToExcel($entries) {
  if (-not (Test-Path $WorkbookPath)) {
    throw "Workbook not found: $WorkbookPath"
  }

  $excel = $null
  $workbook = $null

  try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    $workbook = $excel.Workbooks.Open($WorkbookPath)
    $table = $workbook.Worksheets.Item(1).ListObjects.Item('Submissions')

    foreach ($entry in $entries) {
      $row = $table.ListRows.Add()
      $row.Range.Item(1, 1).Value2 = [string]$entry.Timestamp
      $row.Range.Item(1, 2).Value2 = [string]$entry.Team
      $row.Range.Item(1, 3).Value2 = [string]$entry.Member
      $row.Range.Item(1, 4).Value2 = [string]$entry.Activity
      $row.Range.Item(1, 5).Value2 = if ($entry.DurationMinutes) { [string]$entry.DurationMinutes } else { '' }
      $row.Range.Item(1, 6).Value2 = if ($entry.Steps) { [string]$entry.Steps } else { '' }
      $row.Range.Item(1, 7).Value2 = [string]$entry.Points
    }

    $workbook.Save()
    return @($entries).Count
  }
  finally {
    if ($workbook) { $workbook.Close($false) | Out-Null }
    if ($excel) {
      $excel.Quit() | Out-Null
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
  }
}

function Get-StaticFile($urlPath) {
  if ($urlPath -eq '/' -or $urlPath -eq '') {
    return Join-Path $Root 'index.html'
  }
  $filePath = Join-Path $Root ($urlPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar))
  $fullRoot = [IO.Path]::GetFullPath($Root)
  $fullFile = [IO.Path]::GetFullPath($filePath)
  if (-not $fullFile.StartsWith($fullRoot)) { return $null }
  if (Test-Path $fullFile -PathType Leaf) { return $fullFile }
  return $null
}

$listener = New-Object System.Net.HttpListener
$started = $false
foreach ($tryPort in 3000..3005) {
  try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$tryPort/")
    $listener.Start()
    $Port = $tryPort
    $started = $true
    break
  }
  catch {
    $listener.Close()
  }
}
if (-not $started) {
  Write-Host 'ERROR: Could not start server — ports 3000-3005 are in use.'
  Write-Host 'Close other server windows and try again.'
  exit 1
}

Write-Host ''
Write-Host '  Jacked in June 2026 — local server running'
Write-Host '  -------------------------------------------'
Write-Host "  Website:     http://localhost:$Port"
Write-Host "  Submissions: $WorkbookPath"
Write-Host ''
Write-Host '  Close Excel before submitting if rows fail to append.'
Write-Host '  Press Ctrl+C to stop.'
Write-Host ''

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $path = $request.Url.LocalPath

    # CORS preflight
    if ($request.HttpMethod -eq 'OPTIONS') {
      $context.Response.AddHeader('Access-Control-Allow-Origin', '*')
      $context.Response.AddHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      $context.Response.AddHeader('Access-Control-Allow-Headers', 'Content-Type')
      Write-HttpResponse $context 204 'text/plain' @()
      continue
    }

    if ($path -eq '/api/submit' -and $request.HttpMethod -eq 'POST') {
      $context.Response.AddHeader('Access-Control-Allow-Origin', '*')
      try {
        $reader = New-Object IO.StreamReader($request.InputStream, $request.ContentEncoding)
        $bodyText = $reader.ReadToEnd()
        $reader.Close()
        $body = $bodyText | ConvertFrom-Json
        $entries = if ($body.entries) { @($body.entries) } else { @($body) }
        if (-not $entries.Count) { throw 'No entries provided' }
        $count = Add-EntriesToExcel $entries
        Write-JsonResponse $context 200 @{ ok = $true; count = $count; file = $WorkbookPath; target = 'onedrive' }
      }
      catch {
        Write-JsonResponse $context 500 @{ ok = $false; error = $_.Exception.Message }
      }
      continue
    }

    if ($path -eq '/api/dashboard' -and $request.HttpMethod -eq 'GET') {
      $context.Response.AddHeader('Access-Control-Allow-Origin', '*')
      try {
        $readScript = Join-Path $PSScriptRoot 'read-onedrive.ps1'
        $output = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $readScript 2>&1
        $parsed = $output | ConvertFrom-Json
        if ($parsed.error) { throw $parsed.error }
        $rows = if ($parsed -is [Array]) { $parsed } else { @($parsed) }
        Write-JsonResponse $context 200 @{ ok = $true; rows = $rows }
      }
      catch {
        Write-JsonResponse $context 500 @{ ok = $false; error = $_.Exception.Message; rows = @() }
      }
      continue
    }

    $file = Get-StaticFile $path
    if ($file) {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $mime = if ($Mime.ContainsKey($ext)) { $Mime[$ext] } else { 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($file)
      Write-HttpResponse $context 200 $mime $bytes
    }
    else {
      Write-HttpResponse $context 404 'text/plain' ([Text.Encoding]::UTF8.GetBytes('Not found'))
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
