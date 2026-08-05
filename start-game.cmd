@echo off
setlocal
cd /d "%~dp0"
start "Shan Hai Defense Server" /b python -m http.server 4173
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/"
echo Game server started at http://127.0.0.1:4173/
echo Keep this window open while playing.
endlocal
