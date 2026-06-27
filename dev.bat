@echo off
:: Check if already running as admin
net session >nul 2>&1
if %errorlevel% == 0 (
    goto :run
) else (
    :: Re-launch as admin, keeping the window open after the command finishes
    powershell -Command "Start-Process cmd -ArgumentList '/k cd /d ""%~dp0"" && npm run dev' -Verb RunAs"
    exit /b
)

:run
cd /d "%~dp0"
npm run dev
pause
