@echo off
title Game Train - Deploy
powershell -ExecutionPolicy Bypass -File "%~dp0DEPLOY.ps1"
echo.
echo Press any key to close...
pause > /dev/null
