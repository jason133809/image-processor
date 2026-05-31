from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
from ..database import get_db
from ..models.database import GeneratedImage
from ..models.schemas import ResizeRequest, ImageResponse
from ..services.image_service import resize_image, get_image_info
from ..services.credit_service import consume_credits, get_credit_cost
from ..utils.file_handler import save_upload_file, get_file_url
from ..config import get_settings
from .auth import get_current_user

router = APIRouter(prefix="/api/image-utils", tags=["图片工具"])
settings = get_settings()


@router.post("/resize", response_model=ImageResponse)
async def resize(
    file: UploadFile = File(...),
    width: int = 1024,
    height: int = 1024,
    maintain_aspect_ratio: bool = True,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """调整图片尺寸"""
    # 计算积分消耗
    credit_cost = get_credit_cost("resize", current_user.membership_level.value)

    # 检查并扣除积分
    user = consume_credits(db, current_user.id, credit_cost, f"图片缩放: {width}x{height}")
    if not user:
        raise HTTPException(status_code=400, detail="积分不足")

    try:
        # 保存上传的图片
        input_path = await save_upload_file(file)

        # 生成输出文件路径
        output_filename = f"{uuid.uuid4()}.png"
        output_path = os.path.join(settings.generated_dir, output_filename)

        # 调整尺寸
        resize_image(input_path, output_path, width, height, maintain_aspect_ratio)

        # 记录生成历史
        generated_image = GeneratedImage(
            user_id=current_user.id,
            image_type="resize",
            prompt=f"{width}x{height}",
            file_path=output_path,
            credits_used=credit_cost
        )
        db.add(generated_image)
        db.commit()

        # 删除临时上传文件
        if os.path.exists(input_path):
            os.remove(input_path)

        return ImageResponse(
            image_url=get_file_url(output_path),
            credits_used=credit_cost,
            message="图片缩放成功"
        )

    except Exception as e:
        # 如果处理失败，退还积分
        consume_credits(db, current_user.id, -credit_cost, "处理失败退款")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/info")
async def get_info(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """获取图片信息（不消耗积分）"""
    try:
        # 保存上传的图片
        input_path = await save_upload_file(file)

        # 获取图片信息
        info = get_image_info(input_path)

        # 删除临时文件
        if os.path.exists(input_path):
            os.remove(input_path)

        return info

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/formats")
async def get_supported_formats():
    """获取支持的图片格式"""
    return {
        "input_formats": ["PNG", "JPEG", "JPG", "WEBP", "BMP", "GIF"],
        "output_formats": ["PNG", "JPEG", "WEBP"]
    }
