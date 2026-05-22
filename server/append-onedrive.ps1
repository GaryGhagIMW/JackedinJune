param(
  [Parameter(Mandatory = $true)]
  [string]$EntriesJson
)

$ErrorActionPreference = 'Stop'

$Entries = $EntriesJson | ConvertFrom-Json
$workbookPath = 'C:\Users\gary.ghag\OneDrive - IMW Industries Ltd\Jacked in June 2026\jij-2026-submissions.xlsx'

if (-not (Test-Path $workbookPath)) {
  throw "Workbook not found: $workbookPath"
}

$excel = $null
$workbook = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  $workbook = $excel.Workbooks.Open($workbookPath)
  $worksheet = $workbook.Worksheets.Item(1)
  $table = $worksheet.ListObjects.Item('Submissions')

  foreach ($entry in $Entries) {
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
  @{ ok = $true; count = @($Entries).Count; file = $workbookPath; target = 'onedrive' } | ConvertTo-Json -Compress
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
