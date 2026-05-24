@echo off
echo ========================================
echo  MathAI Solver - Starting Frontend Server
echo ========================================
echo.
echo Frontend will start on: http://localhost:5173
echo.
echo Make sure the backend is running on port 8080!
echo.
echo Press Ctrl+C to stop the server
echo.

cd frontend
call npx live-server --port=5173 --host=localhost --no-browser
