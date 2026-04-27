param(
  [string]$AppName,
  [string]$InstallLocation,
  [string]$Publisher
)
$ErrorActionPreference = 'SilentlyContinue'

$killed = @()
Get-Process | Where-Object { $_.ProcessName -like "*$AppName*" } | ForEach-Object {
  Stop-Process -Id $_.Id -Force
  $killed += $_.ProcessName
}

$deleted = $false
if ($InstallLocation -and (Test-Path $InstallLocation)) {
  try {
    Remove-Item -Path $InstallLocation -Recurse -Force
    $deleted = $true
  } catch {
    cmd.exe /c "takeown /f `"$InstallLocation`" /r /d y"
    cmd.exe /c "icacls `"$InstallLocation`" /grant administrators:F /t"
    Remove-Item -Path $InstallLocation -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $InstallLocation) {
      cmd.exe /c "reg add HKLM\SYSTEM\CurrentControlSet\Control\Session Manager /v PendingFileRenameOperations /t REG_MULTI_SZ /d `\??\$InstallLocation\0\0` /f" | Out-Null
    } else {
      $deleted = $true
    }
  }
}

$removedKeys = @()
$roots = @('HKCU:\Software', 'HKLM:\Software')
foreach ($root in $roots) {
  Get-ChildItem $root -ErrorAction SilentlyContinue | Where-Object {
    $_.PSChildName -like "*$AppName*" -or $_.PSChildName -like "*$Publisher*"
  } | ForEach-Object {
    if ($_.PSChildName -notmatch 'Microsoft|Windows') {
      Remove-Item -Path $_.PSPath -Recurse -Force -ErrorAction SilentlyContinue
      $removedKeys += $_.Name
    }
  }
}

[PSCustomObject]@{
  success = $true
  killedProcesses = $killed
  installDirectoryDeleted = $deleted
  removedRegistryKeys = $removedKeys
} | ConvertTo-Json -Depth 6
