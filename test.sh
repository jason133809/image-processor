#!/bin/bash

# 图片处理平台 - 测试脚本

echo "🧪 开始测试..."

# 检查后端
echo ""
echo "1️⃣ 测试后端健康检查..."
HEALTH_CHECK=$(curl -s http://localhost:8000/health)
if [ "$HEALTH_CHECK" == '{"status":"healthy"}' ]; then
    echo "✅ 后端健康检查通过"
else
    echo "❌ 后端健康检查失败"
    echo "响应: $HEALTH_CHECK"
fi

# 检查API文档
echo ""
echo "2️⃣ 测试API文档..."
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs)
if [ "$DOCS_STATUS" == "200" ]; then
    echo "✅ API文档可访问"
else
    echo "❌ API文档访问失败 (状态码: $DOCS_STATUS)"
fi

# 检查前端
echo ""
echo "3️⃣ 测试前端..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ 前端可访问"
else
    echo "❌ 前端访问失败 (状态码: $FRONTEND_STATUS)"
fi

echo ""
echo "📊 测试完成！"
echo ""
echo "如果所有测试通过，你可以访问:"
echo "  前端: http://localhost:5173"
echo "  API文档: http://localhost:8000/docs"
