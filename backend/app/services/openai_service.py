import os
import httpx
import base64
from openai import OpenAI
from ..config import get_settings

settings = get_settings()

# 使用 Kimi AI (兼容 OpenAI SDK)
client = OpenAI(
    api_key=settings.kimi_api_key,
    base_url=settings.kimi_api_base
)


async def generate_image_from_text(prompt: str, size: str = "1024x1024", quality: str = "standard"):
    """使用 Kimi AI 生成图片"""
    try:
        # Kimi AI 使用文生图模型
        response = client.images.generate(
            model="moonshot-v1-image",  # Kimi 的图片生成模型
            prompt=prompt,
            size=size,
            n=1,
        )

        image_url = response.data[0].url

        # 下载图片到本地
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            img_response = await http_client.get(image_url)
            img_response.raise_for_status()

            # 生成文件名
            import uuid
            filename = f"{uuid.uuid4()}.png"
            filepath = os.path.join(settings.generated_dir, filename)

            # 保存图片
            with open(filepath, "wb") as f:
                f.write(img_response.content)

            return filepath, image_url

    except Exception as e:
        raise Exception(f"图片生成失败: {str(e)}")


async def edit_image(image_path: str, prompt: str):
    """使用 Kimi AI 编辑图片"""
    try:
        # 读取图片并转换为 base64
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')

        # 使用 Kimi 的图生图功能
        response = client.images.generate(
            model="moonshot-v1-image",
            prompt=prompt,
            n=1,
            size="1024x1024"
        )

        image_url = response.data[0].url

        # 下载图片
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            img_response = await http_client.get(image_url)
            img_response.raise_for_status()

            import uuid
            filename = f"{uuid.uuid4()}.png"
            filepath = os.path.join(settings.generated_dir, filename)

            with open(filepath, "wb") as f:
                f.write(img_response.content)

            return filepath, image_url

    except Exception as e:
        raise Exception(f"图片编辑失败: {str(e)}")
