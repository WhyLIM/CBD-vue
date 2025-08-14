#!/bin/bash

echo "========================================"
echo "          CBD Startup Script            "
echo "========================================"
echo

echo "Starting the backend server..."
cd CBD-backend && pnpm dev &
BACKEND_PID=$!

sleep 3

echo "Starting the frontend server..."
cd ../CBD-frontend && pnpm dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "        Server startup completed!       "
echo "========================================"
echo "  Frontend Address: http://localhost:5173"
echo "  Backend Address: http://localhost:3000"
echo "  API Doc: http://localhost:3000/api/health"
echo "========================================"
echo
echo "Press Ctrl+C to stop all servers."

# 等待用户中断
trap "echo 'Stopping the server...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# 保持脚本运行
wait