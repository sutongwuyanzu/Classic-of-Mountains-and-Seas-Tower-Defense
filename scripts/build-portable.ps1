$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$electronDist = Join-Path $root 'node_modules\electron\dist'
$output = Join-Path $root 'release\ShanHaiDefense-win-unpacked'

if (-not (Test-Path (Join-Path $electronDist 'electron.exe'))) {
  throw 'Electron runtime missing. Run npm install first.'
}

if (Test-Path $output) {
  Remove-Item -LiteralPath $output -Recurse -Force
}
New-Item -ItemType Directory -Force $output | Out-Null
Copy-Item -Path (Join-Path $electronDist '*') -Destination $output -Recurse -Force
Rename-Item -LiteralPath (Join-Path $output 'electron.exe') -NewName 'ShanHaiDefense.exe'

$app = Join-Path $output 'resources\app'
New-Item -ItemType Directory -Force $app | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'index.html') -Destination $app -Force
Copy-Item -LiteralPath (Join-Path $root 'styles.css') -Destination $app -Force
Copy-Item -LiteralPath (Join-Path $root 'package.json') -Destination $app -Force
Copy-Item -LiteralPath (Join-Path $root 'src') -Destination $app -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root 'assets') -Destination $app -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root 'electron') -Destination $app -Recurse -Force

Write-Output "Portable build created: $output"
