@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-dev-server.ps1"
if errorlevel 1 (
  echo Failed to start the local game server.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4173/"
echo Game server started at http://127.0.0.1:4173/
endlocal
