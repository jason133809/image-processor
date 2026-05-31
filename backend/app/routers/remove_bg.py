from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
from ..database import get_db
from ..models.database import GeneratedImage
from ..models.schemas import ImageResponse
from ..services.rembg_service import remove_background
from ..services.credit_service import consume_credits, get_credit_cost
from ..utils.file_handler import save_upload_file, get_file_url
from ..config import get_settings
from .auth import get_current_user

router = APIRouter(prefix="/api/remove-bg", tags=["抠图"])
settings = get_settings()


@router.post("/process", response_model=ImageResponse)
async def remove_bg(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """移除图片背景"""
    # 计算积分消耗
    credit_cost = get_credit_cost("remove_bg", current_user.membership_level.value)

    # 检查并扣除积分
    user = consume_credits(db, current_user.id, credit_cost, "抠图")
    if not user:
        raise HTTPException(status_code=400, detail="积分不足")

    try:
        # 保存上传的图片
        input_path = await save_upload_file(file)

        # 生成输出文件路径
        output_filename = f"{uuid.uuid4()}.png"
        output_path = os.path.join(settings.generated_dir, output_filename)

        # 移除背景
        await remove_background(input_path, output_path)

        # 记录生成历史
        generated_image = GeneratedImage(
            user_id=current_user.id,
            image_type="remove_bg",
            prompt=None,
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
            message="背景移除成功"
        )

    except Exception as e:
        # 如果处理失败，退还积分
        consume_credits(db, current_user.id, -credit_cost, "处理失败退款")
        raise HTTPException(status_code=500, detail=str(e))
