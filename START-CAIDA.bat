@echo off
setlocal
title CAIDA Concept Prototype
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Node.js wurde nicht gefunden.
  echo  Bitte Node.js installieren oder CAIDA ueber einen lokalen Webserver oeffnen.
  echo.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:4177"
node server.js

endlocal

