@echo off
echo ========================================
echo  MathAI Solver - Starting Backend Server
echo ========================================
echo.
echo Backend will start on: http://localhost:8080
echo API Health Check: http://localhost:8080/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
call npm start
