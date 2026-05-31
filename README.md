# 图片处理平台

一个功能完整的AI图片处理Web应用，集成Kimi AI和Supabase。

## 功能特性

### 核心功能
- 🎨 **文生图**: 使用Kimi AI根据文本描述生成图片
- 🖼️ **图生图**: 基于输入图片生成AI变体
- ✂️ **智能抠图**: 自动识别并移除图片背景
- 📐 **图片工具**: 调整尺寸、裁剪、格式转换

### 用户系统
- 👤 邮箱注册登录，JWT认证
- 💰 积分系统：充值、消耗、历史记录
- 👑 会员系统：免费/VIP/SVIP三级会员
- 🎁 新用户注册赠送100积分

### 会员权益
| 功能 | 免费用户 | VIP | SVIP |
|------|---------|-----|------|
| 积分折扣 | 无 | 8折 | 6折 |
| 最大图片尺寸 | 1024x1024 | 1792x1024 | 1792x1024 |
| 批量处理 | ❌ | ✅ | ✅ |
| 优先队列 | ❌ | ✅ | ✅ |
| 高清质量 | ❌ | ✅ | ✅ |

## 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: Kimi AI
- **图片处理**: Pillow, rembg
- **认证**: JWT (python-jose)

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design
- **HTTP客户端**: Axios

## 快速开始

### 前置要求
- Python 3.9+
- Node.js 18+
- Kimi AI API密钥
- Supabase账号

### 1. 克隆项目

```bash
cd ~/Documents/project/image-processor
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写以下配置：
# - KIMI_API_KEY: 你的Kimi AI API密钥
# - SUPABASE_URL: Supabase项目URL
# - SUPABASE_KEY: Supabase匿名密钥
# - DATABASE_URL: PostgreSQL连接字符串
# - SECRET_KEY: JWT密钥（使用 openssl rand -hex 32 生成）
```

### 3. 初始化数据库

1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 进入你的项目
3. 点击左侧 "SQL Editor"
4. 复制 `backend/init_db.sql` 的内容并执行

### 4. 启动后端

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端将运行在 http://localhost:8000
API文档: http://localhost:8000/docs

### 5. 前端设置

```bash
cd ../frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

## 项目结构

```
image-processor/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── routers/        # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   ├── utils/          # 工具函数
│   │   ├── config.py       # 配置管理
│   │   ├── database.py     # 数据库连接
│   │   └── main.py         # 应用入口
│   ├── static/             # 静态文件
│   ├── requirements.txt    # Python依赖
│   ├── init_db.sql         # 数据库初始化脚本
│   └── README.md
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API调用
│   │   ├── types/         # TypeScript类型
│   │   ├── App.tsx        # 主应用
│   │   └── main.tsx       # 入口文件
│   ├── package.json
│   └── vite.config.ts
└── README.md              # 项目文档
```

## API端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 积分
- `GET /api/credits/balance` - 获取积分余额
- `POST /api/credits/recharge` - 充值积分
- `GET /api/credits/history` - 积分历史记录
- `GET /api/credits/costs` - 获取积分消耗标准

### 会员
- `POST /api/membership/subscribe` - 订阅会员
- `GET /api/membership/status` - 获取会员状态
- `GET /api/membership/subscriptions` - 订阅历史
- `GET /api/membership/benefits` - 会员权益说明

### 图片处理
- `POST /api/text-to-image/generate` - 文生图
- `POST /api/image-to-image/generate` - 图生图
- `POST /api/remove-bg/process` - 抠图
- `POST /api/image-utils/resize` - 调整尺寸
- `POST /api/image-utils/info` - 获取图片信息
- `GET /api/image-utils/formats` - 支持的格式

## 积分消耗标准

| 操作 | 基础积分 | VIP (8折) | SVIP (6折) |
|------|---------|-----------|------------|
| 文生图 | 10 | 8 | 6 |
| 图生图 | 8 | 6.4 | 4.8 |
| 抠图 | 2 | 1.6 | 1.2 |
| 缩放 | 0.5 | 0.4 | 0.3 |

## 部署

### 后端部署

推荐使用Docker部署：

```bash
# 构建镜像
docker build -t image-processor-backend ./backend

# 运行容器
docker run -d -p 8000:8000 \
  -e KIMI_API_KEY=your_key \
  -e DATABASE_URL=your_db_url \
  -e SECRET_KEY=your_secret \
  image-processor-backend
```

### 前端部署

```bash
cd frontend
npm run build
# 将 dist/ 目录部署到静态托管服务（Vercel, Netlify等）
```

## 开发说明

### 添加新功能
1. 后端：在 `backend/app/routers/` 添加新路由
2. 前端：在 `frontend/src/components/` 添加新组件
3. 更新API服务：`frontend/src/services/api.ts`

### 数据库迁移
使用Alembic进行数据库迁移：

```bash
cd backend
alembic revision --autogenerate -m "描述"
alembic upgrade head
```

## 常见问题

### 1. Kimi AI API调用失败
- 检查API密钥是否正确
- 确认账户余额充足
- 查看API文档确认模型名称

### 2. 数据库连接失败
- 检查Supabase连接字符串
- 确认数据库已初始化
- 检查网络连接

### 3. 图片上传失败
- 检查文件大小限制（默认10MB）
- 确认static目录有写权限
- 查看后端日志

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提Issue。
