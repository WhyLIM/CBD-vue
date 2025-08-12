@echo off
chcp 65001 >nul
echo ========================================
echo   CBD2 生物标记物数据库系统启动脚本
echo ========================================
echo.

echo 正在启动后端服务器...
start "CBD Backend" cmd /k "cd CBD-backend && pnpm dev"

timeout /t 3 /nobreak >nul

echo 正在启动前端服务器...
start "CBD Frontend" cmd /k "cd CBD-frontend && pnpm dev"

echo.
echo ========================================
echo   服务器启动完成！
echo ========================================
echo   前端地址: http://localhost:5173
echo   后端地址: http://localhost:3000
echo   API文档: http://localhost:3000/api/health
echo ========================================
echo.
echo 按任意键退出...
pause >nul