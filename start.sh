#!/bin/bash

# 图片处理平台 - 一键启动脚本

echo "🚀 启动图片处理平台..."

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 启动后端
echo "📦 启动后端服务..."
cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 检查依赖
if [ ! -f "venv/installed" ]; then
    echo "安装Python依赖..."
    pip install -r requirements.txt
    touch venv/installed
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，请先配置环境变量"
    echo "复制 .env.example 为 .env 并填写配置"
    exit 1
fi

# 启动后端（后台运行）
echo "启动FastAPI服务器..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "后端PID: $BACKEND_PID"

cd ..

# 启动前端
echo "🎨 启动前端服务..."
cd frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "安装Node.js依赖..."
    npm install
fi

# 启动前端（后台运行）
echo "启动Vite开发服务器..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端PID: $FRONTEND_PID"

cd ..

# 保存PID
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

echo ""
echo "✅ 启动完成！"
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "📝 日志文件:"
echo "   后端: backend.log"
echo "   前端: frontend.log"
echo ""
echo "🛑 停止服务: ./stop.sh"
echo ""
