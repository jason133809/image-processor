from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
from ..database import get_db
from ..models.schemas import TextToImageRequest, ImageResponse
from ..models.database import GeneratedImage
from ..services.openai_service import generate_image_from_text
from ..services.credit_service import consume_credits, get_credit_cost
from ..utils.file_handler import get_file_url
from .auth import get_current_user

router = APIRouter(prefix="/api/text-to-image", tags=["文生图"])


@router.post("/generate", response_model=ImageResponse)
async def generate_image(
    request: TextToImageRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """根据文本生成图片"""
    # 计算积分消耗
    credit_cost = get_credit_cost("text_to_image", current_user.membership_level.value)

    # 检查并扣除积分
    user = consume_credits(db, current_user.id, credit_cost, f"文生图: {request.prompt[:50]}")
    if not user:
        raise HTTPException(status_code=400, detail="积分不足")

    try:
        # 生成图片
        filepath, image_url = await generate_image_from_text(
            request.prompt,
            request.size,
            request.quality
        )

        # 记录生成历史
        generated_image = GeneratedImage(
            user_id=current_user.id,
            image_type="text_to_image",
            prompt=request.prompt,
            file_path=filepath,
            credits_used=credit_cost
        )
        db.add(generated_image)
        db.commit()

        return ImageResponse(
            image_url=get_file_url(filepath),
            credits_used=credit_cost,
            message="图片生成成功"
        )

    except Exception as e:
        # 如果生成失败，退还积分
        consume_credits(db, current_user.id, -credit_cost, "生成失败退款")
        raise HTTPException(status_code=500, detail=str(e))
