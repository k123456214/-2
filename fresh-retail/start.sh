#!/bin/bash

# 生鲜称重连锁系统 - 启动脚本

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "=========================================="
echo "   生鲜称重连锁系统 Fresh Retail System"
echo "=========================================="
echo ""

# 检查并启动后端
echo "[1/2] 启动后端服务..."
cd "$BACKEND_DIR"
if [ ! -f "node_modules/express" ]; then
    echo "  安装后端依赖..."
    npm install
fi
node src/server.js > /tmp/fresh-retail-backend.log 2>&1 &
BACKEND_PID=$!
echo "  后端服务已启动 (PID: $BACKEND_PID) - http://localhost:3000"

sleep 2

# 检查并启动前端
echo "[2/2] 启动前端服务..."
cd "$FRONTEND_DIR"
if [ ! -f "node_modules/vue" ]; then
    echo "  安装前端依赖..."
    npm install
fi
npm run dev > /tmp/fresh-retail-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  前端服务已启动 (PID: $FRONTEND_PID) - http://localhost:5173"

echo ""
echo "=========================================="
echo "  系统启动完成！"
echo "=========================================="
echo ""
echo "  前端地址: http://localhost:5173"
echo "  后端地址: http://localhost:3000"
echo ""
echo "  默认管理员账号: admin / admin123"
echo "  收银员账号:   cashier1 / 123456"
echo ""
echo "  后端日志: /tmp/fresh-retail-backend.log"
echo "  前端日志: /tmp/fresh-retail-frontend.log"
echo ""
echo "  按任意键停止所有服务..."
echo "=========================================="

read -n 1 -s
echo ""
echo "正在停止服务..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "服务已停止。"
