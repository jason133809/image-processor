#!/bin/bash

# 图片处理平台 - 快速配置脚本

echo "🔧 图片处理平台 - 快速配置向导"
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 配置后端
echo "📦 配置后端..."
cd backend

if [ -f ".env" ]; then
    echo "⚠️  .env 文件已存在，是否覆盖? (y/n)"
    read -r overwrite
    if [ "$overwrite" != "y" ]; then
        echo "跳过后端配置"
        cd ..
        exit 0
    fi
fi

# 生成 SECRET_KEY
SECRET_KEY=$(openssl rand -hex 32)

echo ""
echo "请输入以下配置信息:"
echo ""

# Kimi API Key
echo -n "Kimi API Key (从 https://platform.moonshot.cn 获取): "
read -r KIMI_API_KEY

# Supabase配置
echo -n "Supabase URL (例如: https://xxx.supabase.co): "
read -r SUPABASE_URL

echo -n "Supabase Anon Key: "
read -r SUPABASE_KEY

echo -n "Database URL (PostgreSQL连接字符串): "
read -r DATABASE_URL

# 创建 .env 文件
cat > .env << EOF
# Kimi AI API
KIMI_API_KEY=$KIMI_API_KEY
KIMI_API_BASE=https://api.moonshot.cn/v1

# Supabase Database
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
DATABASE_URL=$DATABASE_URL

# JWT Secret
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App Settings
UPLOAD_DIR=./static/uploads
GENERATED_DIR=./static/generated
MAX_UPLOAD_SIZE=10485760

# Payment (optional)
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
WECHAT_APP_ID=
WECHAT_APP_SECRET=
EOF

echo ""
echo "✅ 后端配置完成！"
echo ""
echo "📋 下一步:"
echo "1. 在 Supabase 控制台执行 backend/init_db.sql 初始化数据库"
echo "2. 运行 ./start.sh 启动项目"
echo ""
