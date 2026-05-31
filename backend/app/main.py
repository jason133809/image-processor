from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .config import get_settings
from .routers import auth, credits, membership, text_to_image, image_to_image, remove_bg, image_utils

settings = get_settings()

app = FastAPI(
    title="AI Image Processor API",
    description="AI-powered image generation and processing service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 确保静态文件目录存在
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.generated_dir, exist_ok=True)

# 挂载静态文件
app.mount("/static/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
app.mount("/static/generated", StaticFiles(directory=settings.generated_dir), name="generated")

# 注册路由
app.include_router(auth.router)
app.include_router(credits.router)
app.include_router(membership.router)
app.include_router(text_to_image.router)
app.include_router(image_to_image.router)
app.include_router(remove_bg.router)
app.include_router(image_utils.router)


@app.get("/")
async def root():
    return {
        "message": "图片处理平台 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
