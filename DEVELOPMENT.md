# 开发指南

## 开发环境设置

### 1. 安装依赖

#### 后端
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 配置开发环境变量

复制 `.env.example` 为 `.env`:

```bash
cd backend
cp .env.example .env
```

填写开发环境配置：
```bash
# 使用测试API密钥
KIMI_API_KEY=sk-test-xxx

# 本地数据库或Supabase测试项目
DATABASE_URL=postgresql://localhost:5432/image_processor_dev

# 开发用密钥
SECRET_KEY=dev-secret-key-change-in-production
```

### 3. 启动开发服务器

#### 后端（带热重载）
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

#### 前端（带热重载）
```bash
cd frontend
npm run dev
```

## 项目结构详解

### 后端结构

```
backend/
├── app/
│   ├── routers/          # API路由层
│   │   ├── auth.py       # 认证相关API
│   │   ├── credits.py    # 积分相关API
│   │   ├── membership.py # 会员相关API
│   │   ├── text_to_image.py
│   │   ├── image_to_image.py
│   │   ├── remove_bg.py
│   │   └── image_utils.py
│   ├── services/         # 业务逻辑层
│   │   ├── auth_service.py      # 认证服务
│   │   ├── credit_service.py    # 积分服务
│   │   ├── membership_service.py # 会员服务
│   │   ├── openai_service.py    # Kimi AI集成
│   │   ├── rembg_service.py     # 抠图服务
│   │   └── image_service.py     # 图片处理服务
│   ├── models/           # 数据模型层
│   │   ├── database.py   # SQLAlchemy模型
│   │   └── schemas.py    # Pydantic模型
│   ├── utils/            # 工具函数
│   │   └── file_handler.py
│   ├── config.py         # 配置管理
│   ├── database.py       # 数据库连接
│   └── main.py           # 应用入口
```

### 前端结构

```
frontend/
├── src/
│   ├── components/       # React组件
│   │   ├── TextToImage.tsx
│   │   ├── ImageToImage.tsx
│   │   ├── RemoveBackground.tsx
│   │   ├── ImageUtils.tsx
│   │   └── AuthModal.tsx
│   ├── services/         # API服务
│   │   └── api.ts        # Axios封装
│   ├── types/            # TypeScript类型
│   │   └── index.ts
│   ├── App.tsx           # 主应用
│   ├── App.css           # 样式
│   └── main.tsx          # 入口
```

## 添加新功能

### 示例：添加"图片滤镜"功能

#### 1. 后端实现

**创建服务** `backend/app/services/filter_service.py`:

```python
from PIL import Image, ImageFilter

def apply_filter(input_path: str, output_path: str, filter_type: str):
    img = Image.open(input_path)

    if filter_type == "blur":
        img = img.filter(ImageFilter.BLUR)
    elif filter_type == "sharpen":
        img = img.filter(ImageFilter.SHARPEN)
    elif filter_type == "grayscale":
        img = img.convert("L")

    img.save(output_path)
    return output_path
```

**创建路由** `backend/app/routers/filters.py`:

```python
from fastapi import APIRouter, UploadFile, File
from ..services.filter_service import apply_filter

router = APIRouter(prefix="/api/filters", tags=["滤镜"])

@router.post("/apply")
async def apply_image_filter(
    file: UploadFile = File(...),
    filter_type: str = "blur"
):
    # 实现逻辑
    pass
```

**注册路由** 在 `backend/app/main.py`:

```python
from .routers import filters

app.include_router(filters.router)
```

#### 2. 前端实现

**创建组件** `frontend/src/components/ImageFilters.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, Upload, Select, Button } from 'antd';

const ImageFilters: React.FC = () => {
  const [filterType, setFilterType] = useState('blur');

  return (
    <Card title="图片滤镜">
      <Select value={filterType} onChange={setFilterType}>
        <Select.Option value="blur">模糊</Select.Option>
        <Select.Option value="sharpen">锐化</Select.Option>
        <Select.Option value="grayscale">灰度</Select.Option>
      </Select>
      {/* 其他UI */}
    </Card>
  );
};

export default ImageFilters;
```

**添加API** 在 `frontend/src/services/api.ts`:

```typescript
export const imageAPI = {
  // ... 现有方法
  applyFilter: (file: File, filterType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/filters/apply', formData, {
      params: { filter_type: filterType }
    });
  },
};
```

**集成到主应用** 在 `frontend/src/App.tsx`:

```typescript
import ImageFilters from './components/ImageFilters';

// 在Tabs中添加新项
{
  key: '5',
  label: '滤镜',
  children: <ImageFilters />,
}
```

## 数据库操作

### 添加新表

1. 在 `backend/app/models/database.py` 定义模型:

```python
class ImageFilter(Base):
    __tablename__ = "image_filters"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
```

2. 更新 `init_db.sql`:

```sql
CREATE TABLE image_filters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
```

3. 在Supabase执行SQL

### 查询示例

```python
from sqlalchemy.orm import Session
from .models.database import User

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_users_by_membership(db: Session, level: str):
    return db.query(User).filter(
        User.membership_level == level
    ).all()
```

## 测试

### 后端测试

创建 `backend/tests/test_api.py`:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_register():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
```

运行测试:
```bash
pytest backend/tests/
```

### 前端测试

创建 `frontend/src/components/__tests__/TextToImage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import TextToImage from '../TextToImage';

test('renders text to image component', () => {
  render(<TextToImage />);
  expect(screen.getByText('文生图')).toBeInTheDocument();
});
```

## 调试技巧

### 后端调试

1. **使用日志**:
```python
import logging
logger = logging.getLogger(__name__)

logger.info(f"Processing image: {filename}")
logger.error(f"Error: {str(e)}")
```

2. **使用断点**:
```python
import pdb; pdb.set_trace()
```

3. **查看SQL查询**:
```python
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    print("SQL:", statement)
```

### 前端调试

1. **使用React DevTools**
2. **Console日志**:
```typescript
console.log('API Response:', response.data);
```

3. **Network面板**: 查看API请求和响应

## 代码规范

### Python (后端)

- 使用 Black 格式化代码
- 使用 Flake8 检查代码质量
- 遵循 PEP 8 规范

```bash
pip install black flake8
black backend/
flake8 backend/
```

### TypeScript (前端)

- 使用 ESLint 和 Prettier
- 遵循 Airbnb 风格指南

```bash
npm run lint
npm run format
```

## Git工作流

### 分支策略

- `main`: 生产环境
- `develop`: 开发环境
- `feature/*`: 新功能
- `bugfix/*`: 错误修复

### 提交规范

```
feat: 添加图片滤镜功能
fix: 修复文件上传bug
docs: 更新README
style: 代码格式化
refactor: 重构积分服务
test: 添加单元测试
chore: 更新依赖
```

## 性能优化

### 后端优化

1. **使用异步操作**:
```python
async def process_image(file: UploadFile):
    content = await file.read()
    # 处理...
```

2. **数据库查询优化**:
```python
# 使用索引
# 避免N+1查询
# 使用连接池
```

3. **缓存**:
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_membership_benefits(level: str):
    # ...
```

### 前端优化

1. **懒加载组件**:
```typescript
const ImageFilters = React.lazy(() => import('./components/ImageFilters'));
```

2. **图片优化**:
```typescript
<Image
  src={url}
  placeholder={<Spin />}
  preview={false}
/>
```

3. **防抖和节流**:
```typescript
import { debounce } from 'lodash';

const handleSearch = debounce((value) => {
  // 搜索逻辑
}, 300);
```

## 常见问题

### Q: 如何更换AI服务提供商？

A: 修改 `backend/app/services/openai_service.py`，实现新的API调用逻辑。

### Q: 如何添加新的会员等级？

A:
1. 更新 `backend/app/models/database.py` 的枚举
2. 更新 `backend/app/services/membership_service.py` 的权益配置
3. 更新前端类型定义

### Q: 如何自定义积分消耗规则？

A: 修改 `backend/app/services/credit_service.py` 的 `CREDIT_COSTS` 字典。

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 资源链接

- [FastAPI文档](https://fastapi.tiangolo.com/)
- [React文档](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Supabase文档](https://supabase.com/docs)
- [Kimi AI文档](https://platform.moonshot.cn/docs)
