@echo off
echo ========================================
echo  Starting Backend (SIMPLE MODE)
echo ========================================
echo.
echo This version runs without helmet, joi, and rate-limit
echo Use this if npm install hasn't been run yet
echo.
echo Backend will start on: http://localhost:8080
echo.

node server-simple.js
