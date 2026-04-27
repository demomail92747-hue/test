param(
  [string]$UninstallString,
  [string]$AppName,
  [bool]$Silent = $true
)
$ErrorActionPreference = 'Stop'

if (-not $UninstallString) {
  [PSCustomObject]@{ success = $false; message = "No uninstall string for $AppName" } | ConvertTo-Json
  exit 0
}

$cmd = $UninstallString
if ($Silent) {
  if ($cmd -match 'msiexec') {
    $cmd = $cmd -replace '/I', '/X'
    if ($cmd -notmatch '/qn') { $cmd += ' /qn /norestart' }
  } elseif ($cmd -notmatch '/S|/quiet|/silent') {
    $cmd += ' /S'
  }
}

try {
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cmd -Wait -PassThru | Out-Null
  [PSCustomObject]@{ success = $true; message = "Uninstall command executed for $AppName" } | ConvertTo-Json
} catch {
  [PSCustomObject]@{ success = $false; message = $_.Exception.Message } | ConvertTo-Json
}
