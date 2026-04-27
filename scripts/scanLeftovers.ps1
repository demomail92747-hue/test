param(
  [string]$AppName,
  [string]$InstallLocation,
  [string]$Publisher
)
$ErrorActionPreference = 'SilentlyContinue'

$targets = @(
  "$env:ProgramFiles",
  "$env:ProgramFiles(x86)",
  "$env:LOCALAPPDATA",
  "$env:APPDATA",
  "$env:TEMP"
)

$needle = ($AppName -replace '[^a-zA-Z0-9]', '').ToLower()
$pubNeedle = ($Publisher -replace '[^a-zA-Z0-9]', '').ToLower()
$results = @()

foreach ($root in $targets) {
  if (-not (Test-Path $root)) { continue }
  Get-ChildItem -Path $root -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $token = ($_.Name -replace '[^a-zA-Z0-9]', '').ToLower()
    $score = 0
    if ($token -like "*$needle*") { $score += 70 }
    if ($pubNeedle -and $token -like "*$pubNeedle*") { $score += 20 }
    if ($InstallLocation -and $_.FullName -eq $InstallLocation) { $score += 10 }

    if ($score -ge 40) {
      $results += [PSCustomObject]@{
        type = 'FileSystem'
        path = $_.FullName
        confidence = $score
      }
    }
  }
}

$regPaths = @(
  'HKCU:\Software',
  'HKLM:\Software'
)

foreach ($regRoot in $regPaths) {
  Get-ChildItem -Path $regRoot -ErrorAction SilentlyContinue | ForEach-Object {
    $n = ($_.PSChildName -replace '[^a-zA-Z0-9]', '').ToLower()
    $score = 0
    if ($n -like "*$needle*") { $score += 80 }
    if ($pubNeedle -and $n -like "*$pubNeedle*") { $score += 20 }
    if ($score -ge 60) {
      $results += [PSCustomObject]@{
        type = 'Registry'
        path = $_.Name
        confidence = $score
      }
    }
  }
}

$results | Sort-Object confidence -Descending | ConvertTo-Json -Depth 4
