$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$port = 4173

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
  $python = (Get-Command python.exe -ErrorAction Stop).Source
  $logDir = Join-Path $root '.logs'
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  Start-Process -FilePath $python `
    -ArgumentList @('-m', 'http.server', "$port", '--bind', '127.0.0.1') `
    -WorkingDirectory $root `
    -RedirectStandardOutput (Join-Path $logDir 'dev-server.out.log') `
    -RedirectStandardError (Join-Path $logDir 'dev-server.err.log') `
    -WindowStyle Hidden
}

for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$port/" -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
      Write-Output "Game server ready at http://127.0.0.1:$port/"
      exit 0
    }
  } catch {
    Start-Sleep -Milliseconds 250
  }
}

throw "The local game server did not become ready on port $port."
