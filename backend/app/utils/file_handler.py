import os
import uuid
from fastapi import UploadFile
from ..config import get_settings

settings = get_settings()


async def save_upload_file(upload_file: UploadFile) -> str:
    """保存上传的文件"""
    # 生成唯一文件名
    file_extension = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    filepath = os.path.join(settings.upload_dir, filename)

    # 保存文件
    with open(filepath, "wb") as f:
        content = await upload_file.read()
        f.write(content)

    return filepath


def get_file_url(filepath: str) -> str:
    """获取文件的URL"""
    filename = os.path.basename(filepath)
    return f"/static/{filename}"


def delete_file(filepath: str):
    """删除文件"""
    if os.path.exists(filepath):
        os.remove(filepath)
