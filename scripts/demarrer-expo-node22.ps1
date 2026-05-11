param(
  [switch]$Tunnel,
  [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

$fnmCandidates = @(
  "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe"
)

$fnmCommand = Get-Command fnm -ErrorAction SilentlyContinue
if ($fnmCommand) {
  $fnmCandidates += $fnmCommand.Source
}

$fnm = $fnmCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $fnm) {
  Write-Error "fnm.exe est introuvable. Lance d'abord: winget install Schniz.fnm"
}

& $fnm install 22
$fnmEnv = (& $fnm env --shell powershell) -join [Environment]::NewLine
Invoke-Expression $fnmEnv
& $fnm use 22

$nodeVersion = node -v
Write-Host "Node actif: $nodeVersion"

if (-not $nodeVersion.StartsWith("v22.")) {
  Write-Error "Node 22 n'est pas actif. Version detectee: $nodeVersion"
}

if ($CheckOnly) {
  exit 0
}

if ($Tunnel) {
  npx expo start -c --tunnel
} else {
  npx expo start -c --host lan
}
