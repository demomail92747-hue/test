param(
  [string]$BeforePath,
  [string]$AfterPath
)
$ErrorActionPreference = 'Stop'

$before = Get-Content $BeforePath -Raw | ConvertFrom-Json
$after = Get-Content $AfterPath -Raw | ConvertFrom-Json

$newFiles = $after.files | Where-Object { $_ -notin $before.files }
$newRegistry = $after.registry | Where-Object { $_ -notin $before.registry }

[PSCustomObject]@{
  newFiles = $newFiles
  newRegistry = $newRegistry
} | ConvertTo-Json -Depth 6
