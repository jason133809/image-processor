# 快速开始指南

## 5分钟快速启动

### 前置准备

1. **获取 Kimi AI API 密钥**
   - 访问 https://platform.moonshot.cn
   - 注册/登录账号
   - 创建 API Key

2. **创建 Supabase 项目**
   - 访问 https://supabase.com
   - 创建新项目
   - 获取项目 URL 和 API Key

### 一键配置和启动

```bash
# 1. 进入项目目录
cd ~/Documents/project/image-processor

# 2. 运行配置向导
./setup.sh

# 3. 初始化数据库
# 登录 Supabase 控制台 -> SQL Editor
# 复制并执行 backend/init_db.sql 的内容

# 4. 启动项目
./start.sh
```

### 访问应用

- 前端: http://localhost:5173
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

### 测试功能

1. **注册账号**
   - 打开前端页面
   - 点击"登录/注册"
   - 注册新账号（自动赠送100积分）

2. **文生图**
   - 切换到"文生图"标签
   - 输入提示词，例如："一只可爱的橘猫在阳光下打盹"
   - 点击"生成图片"

3. **抠图**
   - 切换到"智能抠图"标签
   - 上传一张图片
   - 点击"一键抠图"

4. **查看积分**
   - 右上角显示当前积分余额
   - 每次操作会自动扣除相应积分

## 常见问题

### Q: 启动失败怎么办？

A: 检查以下几点：
1. Python 3.9+ 和 Node.js 18+ 已安装
2. .env 文件配置正确
3. 数据库已初始化
4. 端口 8000 和 5173 未被占用

### Q: 如何停止服务？

A: 运行 `./stop.sh`

### Q: 如何查看日志？

A:
```bash
tail -f backend.log  # 后端日志
tail -f frontend.log # 前端日志
```

### Q: Kimi API 调用失败？

A:
1. 检查 API Key 是否正确
2. 确认账户余额充足
3. 查看 backend.log 获取详细错误信息

### Q: 数据库连接失败？

A:
1. 检查 DATABASE_URL 格式是否正确
2. 确认 Supabase 项目正常运行
3. 检查网络连接

## 下一步

- 阅读 [开发指南](DEVELOPMENT.md) 了解如何添加新功能
- 阅读 [部署指南](DEPLOYMENT.md) 了解如何部署到生产环境
- 查看 [API文档](http://localhost:8000/docs) 了解所有API端点

## 获取帮助

如遇到问题，请：
1. 查看日志文件
2. 检查配置是否正确
3. 参考文档
4. 提交 Issue
