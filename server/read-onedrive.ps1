param(
  [string]$WorkbookPath = 'C:\Users\gary.ghag\OneDrive - IMW Industries Ltd\Jacked in June 2026\jij-2026-submissions.xlsx'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $WorkbookPath)) {
  @() | ConvertTo-Json -Compress
  exit 0
}

$excel = $null
$workbook = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  $workbook = $excel.Workbooks.Open($WorkbookPath, $false, $true)
  $table = $workbook.Worksheets.Item(1).ListObjects.Item('Submissions')
  $rows = @()

  if ($table.ListRows.Count -gt 0) {
    $data = $table.DataBodyRange.Value2
    if ($table.ListRows.Count -eq 1) {
      $data = @(, @($data))
    }
    foreach ($row in $data) {
      if (-not $row -or [string]::IsNullOrWhiteSpace([string]$row[1])) { continue }
      $rows += [ordered]@{
        Timestamp         = [string]$row[0]
        Team              = [string]$row[1]
        Member            = [string]$row[2]
        Activity          = [string]$row[3]
        DurationMinutes   = [string]$row[4]
        Steps             = [string]$row[5]
        Points            = [string]$row[6]
      }
    }
  }

  $rows | ConvertTo-Json -Compress
}
catch {
  @{ ok = $false; error = $_.Exception.Message; rows = @() } | ConvertTo-Json -Compress
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
