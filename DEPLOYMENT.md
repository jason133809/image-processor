# 部署指南

## 生产环境部署

### 方案一：使用Docker部署

#### 1. 创建后端Dockerfile

在 `backend/` 目录创建 `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建静态文件目录
RUN mkdir -p static/uploads static/generated

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. 构建和运行

```bash
# 构建镜像
docker build -t image-processor-backend ./backend

# 运行容器
docker run -d \
  --name image-processor-backend \
  -p 8000:8000 \
  -e KIMI_API_KEY=your_kimi_api_key \
  -e DATABASE_URL=your_database_url \
  -e SECRET_KEY=your_secret_key \
  -v $(pwd)/backend/static:/app/static \
  image-processor-backend
```

#### 3. 使用Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - KIMI_API_KEY=${KIMI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./backend/static:/app/static
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

启动：
```bash
docker-compose up -d
```

### 方案二：传统部署

#### 后端部署（使用Gunicorn）

1. 安装Gunicorn:
```bash
pip install gunicorn
```

2. 创建systemd服务文件 `/etc/systemd/system/image-processor.service`:

```ini
[Unit]
Description=Image Processor Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/image-processor/backend
Environment="PATH=/var/www/image-processor/backend/venv/bin"
ExecStart=/var/www/image-processor/backend/venv/bin/gunicorn \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    app.main:app

[Install]
WantedBy=multi-user.target
```

3. 启动服务:
```bash
sudo systemctl daemon-reload
sudo systemctl enable image-processor
sudo systemctl start image-processor
```

#### 前端部署（使用Nginx）

1. 构建前端:
```bash
cd frontend
npm run build
```

2. 配置Nginx `/etc/nginx/sites-available/image-processor`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/image-processor/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件代理
    location /static {
        proxy_pass http://localhost:8000;
    }

    # 文件上传大小限制
    client_max_body_size 20M;
}
```

3. 启用站点:
```bash
sudo ln -s /etc/nginx/sites-available/image-processor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方案三：云平台部署

#### Vercel (前端)

1. 在项目根目录创建 `vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.com/api/$1"
    }
  ]
}
```

2. 部署:
```bash
npm i -g vercel
vercel --prod
```

#### Railway / Render (后端)

1. 在 `backend/` 目录创建 `railway.toml` 或 `render.yaml`

2. 连接GitHub仓库自动部署

#### Supabase (数据库)

已经在使用Supabase，无需额外配置。

## 环境变量配置

### 生产环境必需配置

```bash
# Kimi AI
KIMI_API_KEY=sk-xxx  # 从 https://platform.moonshot.cn 获取
KIMI_API_BASE=https://api.moonshot.cn/v1

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# JWT
SECRET_KEY=xxx  # 使用 openssl rand -hex 32 生成
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 生产环境建议24小时

# 文件上传
UPLOAD_DIR=/var/www/image-processor/static/uploads
GENERATED_DIR=/var/www/image-processor/static/generated
MAX_UPLOAD_SIZE=20971520  # 20MB
```

## 性能优化

### 1. 启用Redis缓存

```python
# backend/app/cache.py
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expire=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            cached = redis_client.get(cache_key)
            if cached:
                return cached
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expire, result)
            return result
        return wrapper
    return decorator
```

### 2. 使用CDN加速静态文件

配置云存储（如AWS S3, 阿里云OSS）存储生成的图片。

### 3. 数据库连接池

```python
# backend/app/database.py
engine = create_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
```

## 监控和日志

### 1. 配置日志

```python
# backend/app/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### 2. 使用Sentry监控错误

```bash
pip install sentry-sdk
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

## 安全建议

1. **HTTPS**: 生产环境必须使用HTTPS
2. **CORS**: 限制允许的域名
3. **Rate Limiting**: 添加API限流
4. **SQL注入防护**: 使用ORM参数化查询
5. **XSS防护**: 前端输入验证和转义
6. **文件上传**: 验证文件类型和大小
7. **密钥管理**: 使用环境变量，不要硬编码

## 备份策略

### 数据库备份

Supabase自动备份，也可以手动备份：

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 文件备份

定期备份上传和生成的图片：

```bash
tar -czf images_backup_$(date +%Y%m%d).tar.gz backend/static/
```

## 故障排查

### 常见问题

1. **502 Bad Gateway**: 检查后端服务是否运行
2. **数据库连接失败**: 检查DATABASE_URL和网络
3. **图片生成失败**: 检查Kimi API密钥和余额
4. **文件上传失败**: 检查目录权限和磁盘空间

### 查看日志

```bash
# 后端日志
tail -f backend.log

# Nginx日志
tail -f /var/log/nginx/error.log

# 系统服务日志
journalctl -u image-processor -f
```

## 扩展性

### 水平扩展

1. 使用负载均衡器（Nginx, HAProxy）
2. 部署多个后端实例
3. 使用共享存储（S3, OSS）
4. 使用Redis共享会话

### 垂直扩展

1. 增加服务器CPU和内存
2. 优化数据库查询
3. 使用异步任务队列（Celery）
