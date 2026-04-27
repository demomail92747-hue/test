$ErrorActionPreference = 'SilentlyContinue'

function Get-RegistryApps($path) {
  Get-ItemProperty $path | ForEach-Object {
    if ($_.DisplayName) {
      [PSCustomObject]@{
        name = $_.DisplayName
        version = $_.DisplayVersion
        sizeBytes = if ($_.EstimatedSize) { [int64]$_.EstimatedSize * 1KB } else { 0 }
        size = if ($_.EstimatedSize) { "{0:N2} MB" -f ($_.EstimatedSize / 1024) } else { "N/A" }
        installDate = $_.InstallDate
        installLocation = $_.InstallLocation
        uninstallString = $_.UninstallString
        publisher = $_.Publisher
        source = 'Registry'
      }
    }
  }
}

$registryPaths = @(
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
)

$apps = @()
foreach ($path in $registryPaths) {
  $apps += Get-RegistryApps -path $path
}

$apps += Get-AppxPackage | ForEach-Object {
  [PSCustomObject]@{
    name = $_.Name
    version = $_.Version.ToString()
    sizeBytes = 0
    size = 'N/A'
    installDate = $_.InstallDate
    installLocation = $_.InstallLocation
    uninstallString = "Get-AppxPackage -Name '$($_.Name)' | Remove-AppxPackage"
    publisher = $_.Publisher
    source = 'UWP'
  }
}

$apps | Sort-Object name -Unique | ConvertTo-Json -Depth 4
