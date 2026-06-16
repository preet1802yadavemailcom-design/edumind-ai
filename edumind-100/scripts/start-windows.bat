@echo off
title EduMind AI — World No.1
color 0B
echo.
echo ==========================================
echo   EduMind AI — Starting Up...
echo ==========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Go to nodejs.org and install LTS version
    pause
    exit /b 1
)

echo [1/3] Node.js found: OK
echo.

:: Check backend .env
if not exist "backend\.env" (
    echo ERROR: backend/.env file not found!
    echo Run: cd backend ^&^& copy .env.example .env
    echo Then add your GROQ_API_KEY and JWT_SECRET
    pause
    exit /b 1
)

echo [2/3] Backend .env found: OK
echo.

:: Install dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend && npm install && cd ..
)

if not exist "frontend\edumind-ai\node_modules" (
    echo Installing frontend dependencies...
    cd frontend\edumind-ai && npm install && cd ..\..
)

echo [3/3] Dependencies: OK
echo.
echo ==========================================
echo   Starting Backend on port 3001...
echo ==========================================

start "EduMind Backend" cmd /k "cd backend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ==========================================
echo   Starting Frontend on port 5173...
echo ==========================================

start "EduMind Frontend" cmd /k "cd frontend\edumind-ai && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ==========================================
echo   EduMind AI is RUNNING!
echo.
echo   Backend:  http://localhost:3001/health
echo   Frontend: http://localhost:5173
echo.
echo   Opening browser...
echo ==========================================

start http://localhost:5173

pause
