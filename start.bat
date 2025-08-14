@echo off
chcp 65001 >nul
echo ========================================
echo           CBD Startup Script            
echo ========================================
echo.

echo Starting the backend server...
start "CBD Backend" cmd /k "cd CBD-backend && pnpm dev"

timeout /t 3 /nobreak >nul

echo Starting the frontend server...
start "CBD Frontend" cmd /k "cd CBD-frontend && pnpm dev"

echo.
echo ========================================
echo         Server startup completed!       
echo ========================================
echo   Frontend Address: http://localhost:5173
echo   Backend Address: http://localhost:3000
echo   API Doc: http://localhost:3000/api/health
echo ========================================
echo.
echo Press any key to exit...
pause >nul