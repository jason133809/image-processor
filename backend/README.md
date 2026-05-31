# 图片处理平台 - 后端

基于 FastAPI 的图片处理服务，集成 Kimi AI 和 Supabase。

## 功能特性

- 🎨 **文生图**: 使用 Kimi AI 根据文本生成图片
- 🖼️ **图生图**: 基于输入图片生成变体
- ✂️ **抠图**: 使用 rembg 移除图片背景
- 📐 **图片工具**: 缩放、裁剪、格式转换
- 👤 **用户系统**: 邮箱注册登录、JWT 认证
- 💰 **积分系统**: 积分充值、消耗、历史记录
- 👑 **会员系统**: 免费/VIP/SVIP 三级会员，享受不同折扣

## 快速开始

### 1. 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

需要配置：
- `KIMI_API_KEY`: Kimi AI API 密钥
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_KEY`: Supabase 匿名密钥
- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `SECRET_KEY`: JWT 密钥（使用 `openssl rand -hex 32` 生成）

### 3. 初始化数据库

在 Supabase 控制台的 SQL Editor 中运行 `init_db.sql`

### 4. 启动服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 积分
- `GET /api/credits/balance` - 获取积分余额
- `POST /api/credits/recharge` - 充值积分
- `GET /api/credits/history` - 积分历史记录

### 会员
- `POST /api/membership/subscribe` - 订阅会员
- `GET /api/membership/status` - 会员状态
- `GET /api/membership/benefits` - 会员权益

### 图片处理
- `POST /api/text-to-image/generate` - 文生图
- `POST /api/image-to-image/generate` - 图生图
- `POST /api/remove-bg/process` - 抠图
- `POST /api/image-utils/resize` - 调整尺寸
- `POST /api/image-utils/info` - 获取图片信息

## 积分消耗标准

| 操作 | 基础积分 | VIP (8折) | SVIP (6折) |
|------|---------|-----------|------------|
| 文生图 | 10 | 8 | 6 |
| 图生图 | 8 | 6.4 | 4.8 |
| 抠图 | 2 | 1.6 | 1.2 |
| 缩放 | 0.5 | 0.4 | 0.3 |

## 会员权益

### 免费用户
- 注册赠送 100 积分
- 标准积分价格
- 最大图片尺寸: 1024x1024

### VIP 会员
- 积分 8 折优惠
- 月付赠送 50 积分，年付赠送 600 积分
- 最大图片尺寸: 1792x1024
- 支持批量处理
- 优先队列
- 高清质量

### SVIP 会员
- 积分 6 折优惠
- 月付赠送 150 积分，年付赠送 2000 积分
- 最大图片尺寸: 1792x1024
- 支持批量处理
- 优先队列
- 高清质量

## 技术栈

- **框架**: FastAPI
- **数据库**: Supabase (PostgreSQL)
- **AI 服务**: Kimi AI
- **图片处理**: Pillow, rembg
- **认证**: JWT (python-jose)
- **密码加密**: bcrypt (passlib)
