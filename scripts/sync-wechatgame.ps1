$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root 'wechatgame'

Copy-Item -LiteralPath (Join-Path $root 'shared\game-core.js') -Destination (Join-Path $target 'shared\game-core.js') -Force
Copy-Item -Path (Join-Path $root 'miniprogram\assets\*.webp') -Destination (Join-Path $target 'assets') -Force

Write-Host 'WeChat Mini Game shared rules and assets synced.'
