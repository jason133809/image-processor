from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
from ..database import get_db
from ..models.database import GeneratedImage
from ..models.schemas import ImageResponse
from ..services.openai_service import edit_image
from ..services.credit_service import consume_credits, get_credit_cost
from ..utils.file_handler import save_upload_file, get_file_url
from .auth import get_current_user

router = APIRouter(prefix="/api/image-to-image", tags=["图生图"])


@router.post("/generate", response_model=ImageResponse)
async def generate_variation(
    file: UploadFile = File(...),
    prompt: str = "",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """基于输入图片生成变体"""
    # 计算积分消耗
    credit_cost = get_credit_cost("image_to_image", current_user.membership_level.value)

    # 检查并扣除积分
    user = consume_credits(db, current_user.id, credit_cost, f"图生图: {prompt[:50] if prompt else '图片变体'}")
    if not user:
        raise HTTPException(status_code=400, detail="积分不足")

    try:
        # 保存上传的图片
        input_path = await save_upload_file(file)

        # 生成图片
        filepath, image_url = await edit_image(input_path, prompt)

        # 记录生成历史
        generated_image = GeneratedImage(
            user_id=current_user.id,
            image_type="image_to_image",
            prompt=prompt,
            file_path=filepath,
            credits_used=credit_cost
        )
        db.add(generated_image)
        db.commit()

        # 删除临时上传文件
        if os.path.exists(input_path):
            os.remove(input_path)

        return ImageResponse(
            image_url=get_file_url(filepath),
            credits_used=credit_cost,
            message="图片生成成功"
        )

    except Exception as e:
        # 如果生成失败，退还积分
        consume_credits(db, current_user.id, -credit_cost, "生成失败退款")
        raise HTTPException(status_code=500, detail=str(e))
