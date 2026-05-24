@echo off
echo ========================================
echo  MathAI Solver - Installing Dependencies
echo ========================================
echo.

echo [1/2] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'start-backend.bat' to start the backend server
echo 2. Run 'start-frontend.bat' to start the frontend server
echo 3. Open http://localhost:5173 in your browser
echo.
pause
