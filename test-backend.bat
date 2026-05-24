@echo off
echo ========================================
echo  Testing MathAI Backend
echo ========================================
echo.

echo [1/3] Testing health endpoint...
curl -s http://localhost:8080/api/health
echo.
echo.

echo [2/3] Testing registration...
curl -s -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -H "Origin: http://localhost:5173" ^
  -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}" ^
  -c cookies.txt
echo.
echo.

echo [3/3] Testing login...
curl -s -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -H "Origin: http://localhost:5173" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}" ^
  -b cookies.txt
echo.
echo.

echo ========================================
echo  Test Complete
echo ========================================
pause
