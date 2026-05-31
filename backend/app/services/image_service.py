from PIL import Image
import io
from typing import Tuple


def resize_image(input_path: str, output_path: str, width: int, height: int, maintain_aspect_ratio: bool = True):
    """调整图片尺寸"""
    try:
        img = Image.open(input_path)

        if maintain_aspect_ratio:
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
        else:
            img = img.resize((width, height), Image.Resampling.LANCZOS)

        img.save(output_path, quality=95)
        return output_path
    except Exception as e:
        raise Exception(f"图片缩放失败: {str(e)}")


def crop_image(input_path: str, output_path: str, left: int, top: int, right: int, bottom: int):
    """裁剪图片"""
    try:
        img = Image.open(input_path)
        cropped = img.crop((left, top, right, bottom))
        cropped.save(output_path, quality=95)
        return output_path
    except Exception as e:
        raise Exception(f"图片裁剪失败: {str(e)}")


def convert_format(input_path: str, output_path: str, format: str = "PNG"):
    """转换图片格式"""
    try:
        img = Image.open(input_path)

        # 如果是JPEG格式且原图有透明通道，需要转换
        if format.upper() == "JPEG" and img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = background

        img.save(output_path, format=format.upper(), quality=95)
        return output_path
    except Exception as e:
        raise Exception(f"格式转换失败: {str(e)}")


def get_image_info(input_path: str) -> dict:
    """获取图片信息"""
    try:
        img = Image.open(input_path)
        return {
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "mode": img.mode,
            "size_bytes": img.size
        }
    except Exception as e:
        raise Exception(f"获取图片信息失败: {str(e)}")
