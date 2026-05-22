# Creates Dashboard sheet with pivot tables and charts from the Submissions table.
param(
  [string]$WorkbookPath = 'C:\Users\gary.ghag\OneDrive - IMW Industries Ltd\Jacked in June 2026\jij-2026-submissions.xlsx'
)

$ErrorActionPreference = 'Stop'

# Excel constants
$xlDatabase = 1
$xlRowField = 1
$xlDataField = 4
$xlSum = -4157
$xlColumns = 2
$xlPie = 5
$xlBarClustered = 57

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
  $dataSheet = $workbook.Worksheets.Item(1)
  $table = $dataSheet.ListObjects.Item('Submissions')

  if ($table.ListRows.Count -lt 1) {
    Write-Warning 'Submissions table has no data rows yet. Pivots will still be created and update as entries arrive.'
  }

  # Remove existing Dashboard sheet if present
  foreach ($ws in @($workbook.Worksheets)) {
    if ($ws.Name -eq 'Dashboard') {
      $ws.Delete()
    }
  }

  $dashboard = $workbook.Worksheets.Add([System.Reflection.Missing]::Value, $workbook.Worksheets.Item($workbook.Worksheets.Count))
  $dashboard.Name = 'Dashboard'
  $dashboard.Tab.Color = 49477  # blue tab

  $dashboard.Range('A1').Value2 = 'Jacked in June 2026 — Live Stats'
  $dashboard.Range('A1').Font.Size = 16
  $dashboard.Range('A1').Font.Bold = $true

  $sourceRange = $table.Range.Address($false, $false, 1, $true) # external ref

  function New-PivotTable($sheet, $name, $destCell, $rowField, $valueField) {
    $cache = $workbook.PivotCaches().Create($xlDatabase, $table.Range)
    $pt = $cache.CreatePivotTable($sheet.Range($destCell), $name)
    $sheet.PivotTables($name).PivotFields($rowField).Orientation = $xlRowField
    $dataField = $sheet.PivotTables($name).PivotFields($valueField)
    $dataField.Orientation = $xlDataField
    $dataField.Function = $xlSum
    $dataField.NumberFormat = '0.0'
    return $sheet.PivotTables($name)
  }

  # Team points pivot
  $ptTeam = New-PivotTable $dashboard 'PivotTeam' 'A3' 'Team' 'Points'
  $chartTeam = $dashboard.Shapes.AddChart2(240, $xlBarClustered).Chart
  $chartTeam.SetSourceData($ptTeam.TableRange2)
  $chartTeam.HasTitle = $true
  $chartTeam.ChartTitle.Text = 'Points by Team'
  $chartTeam.Parent.Top = $dashboard.Range('A3').Top
  $chartTeam.Parent.Left = $dashboard.Range('F3').Left
  $chartTeam.Parent.Width = 380
  $chartTeam.Parent.Height = 260

  # Member points pivot
  $ptMember = New-PivotTable $dashboard 'PivotMember' 'A20' 'Member' 'Points'
  $chartMember = $dashboard.Shapes.AddChart2(240, $xlBarClustered).Chart
  $chartMember.SetSourceData($ptMember.TableRange2)
  $chartMember.HasTitle = $true
  $chartMember.ChartTitle.Text = 'Points by Member'
  $chartMember.Parent.Top = $dashboard.Range('A20').Top
  $chartMember.Parent.Left = $dashboard.Range('F20').Left
  $chartMember.Parent.Width = 380
  $chartMember.Parent.Height = 280

  # Activity points pivot
  $ptActivity = New-PivotTable $dashboard 'PivotActivity' 'A40' 'Activity' 'Points'
  $chartActivity = $dashboard.Shapes.AddChart2(240, $xlPie).Chart
  $chartActivity.SetSourceData($ptActivity.TableRange2)
  $chartActivity.HasTitle = $true
  $chartActivity.ChartTitle.Text = 'Points by Activity'
  $chartActivity.Parent.Top = $dashboard.Range('A40').Top
  $chartActivity.Parent.Left = $dashboard.Range('F40').Left
  $chartActivity.Parent.Width = 380
  $chartActivity.Parent.Height = 280

  # Hide pivot table detail areas (show charts only)
  $dashboard.Columns('A:E').Hidden = $true

  $dashboard.Activate()
  $workbook.Save()

  Write-Output (@{ ok = $true; message = 'Dashboard sheet created with team, member, and activity charts.' } | ConvertTo-Json -Compress)
}
catch {
  Write-Output (@{ ok = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress)
  exit 1
}
finally {
  if ($workbook) { $workbook.Close($true) | Out-Null }
  if ($excel) {
    $excel.Quit() | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
