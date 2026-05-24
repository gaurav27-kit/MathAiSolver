@echo off
echo ========================================
echo  MathAI Solver - Complete Fix and Start
echo ========================================
echo.

echo [Step 1/5] Killing any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul
echo Done.
echo.

echo [Step 2/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    echo.
    echo Trying to start with simple server instead...
    echo.
    node server-simple.js
    pause
    exit /b 1
)
cd ..
echo Done.
echo.

echo [Step 3/5] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo WARNING: Frontend install failed, but continuing...
)
cd ..
echo Done.
echo.

echo [Step 4/5] Starting backend server...
start "MathAI Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul
echo Done.
echo.

echo [Step 5/5] Starting frontend server...
start "MathAI Frontend" cmd /k "cd frontend && npx live-server --port=5173 --host=localhost"
timeout /t 3 /nobreak > nul
echo Done.
echo.

echo ========================================
echo  Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 3 seconds...
echo.
echo IMPORTANT: Clear your browser cache!
echo Press Ctrl + Shift + Delete in the browser
echo.
timeout /t 3 /nobreak > nul
start http://localhost:5173
echo.
pause
