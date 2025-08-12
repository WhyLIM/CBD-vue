#!/bin/bash

echo "========================================"
echo "  CBD2 生物标记物数据库系统启动脚本"
echo "========================================"
echo

echo "正在启动后端服务器..."
cd CBD-backend && pnpm run dev &
BACKEND_PID=$!

sleep 3

echo "正在启动前端服务器..."
cd ../CBD-vue && pnpm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "  服务器启动完成！"
echo "========================================"
echo "  前端地址: http://localhost:5173"
echo "  后端地址: http://localhost:3000"
echo "  API文档: http://localhost:3000/api/health"
echo "========================================"
echo
echo "按 Ctrl+C 停止所有服务器"

# 等待用户中断
trap "echo '正在停止服务器...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# 保持脚本运行
wait