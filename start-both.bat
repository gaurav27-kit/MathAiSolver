@echo off
echo ========================================
echo  MathAI Solver - Starting Both Servers
echo ========================================
echo.
echo This will open two command windows:
echo 1. Backend Server (port 8080)
echo 2. Frontend Server (port 5173)
echo.
echo Close those windows to stop the servers.
echo.
pause

start "MathAI Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul
start "MathAI Frontend" cmd /k "cd frontend && npx live-server --port=5173 --host=localhost"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:5173
