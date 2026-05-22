@echo off
title Jacked in June 2026 - Submission Server
cd /d "%~dp0"
echo Starting local submission server...
echo.

REM Prefer PowerShell server (no Node.js install required)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\server.ps1"
if errorlevel 1 (
  echo.
  echo PowerShell server failed. Trying Node.js fallback...
  echo.

  set "NODE="
  if exist "%ProgramFiles%\nodejs\node.exe" set "NODE=%ProgramFiles%\nodejs\node.exe"
  if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "NODE=%LOCALAPPDATA%\Programs\node\node.exe"
  if exist "%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe" set "NODE=%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe"

  if defined NODE (
    "%NODE%" server\server.js
  ) else (
    echo ERROR: Could not start the server.
    echo Please ensure PowerShell is available, or install Node.js from https://nodejs.org
  )
)

echo.
pause
