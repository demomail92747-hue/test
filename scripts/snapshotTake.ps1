param([string]$OutputPath)
$ErrorActionPreference = 'Stop'

$snapshot = [PSCustomObject]@{
  createdAt = (Get-Date).ToString('o')
  files = @()
  registry = @()
}

$roots = @(
  "$env:ProgramFiles",
  "$env:ProgramFiles(x86)",
  "$env:LOCALAPPDATA",
  "$env:APPDATA"
)

foreach ($r in $roots) {
  if (Test-Path $r) {
    $snapshot.files += Get-ChildItem -Path $r -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
  }
}

$regRoots = @('HKCU:\Software', 'HKLM:\Software')
foreach ($rr in $regRoots) {
  $snapshot.registry += Get-ChildItem -Path $rr -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
}

$snapshot | ConvertTo-Json -Depth 6 | Set-Content -Path $OutputPath -Encoding UTF8
[PSCustomObject]@{ success = $true; path = $OutputPath } | ConvertTo-Json
