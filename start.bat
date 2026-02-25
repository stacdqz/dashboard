@echo off
title ZERO_OS Dashboard Launcher
color 0A

echo ===================================================
echo               ZERO_OS Dashboard
echo ===================================================
echo.
echo [1/2] Checking dependencies...
call npm install --silent

echo [2/2] Booting up Next.js server...
echo.
echo The dashboard will be available at http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
call npm run dev

pause
