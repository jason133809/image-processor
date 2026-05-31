import os
from rembg import remove
from PIL import Image
import io


async def remove_background(input_path: str, output_path: str):
    """移除图片背景"""
    try:
        with open(input_path, 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)

            with open(output_path, 'wb') as o:
                o.write(output_data)

        return output_path
    except Exception as e:
        raise Exception(f"背景移除失败: {str(e)}")


async def remove_background_bytes(input_bytes: bytes) -> bytes:
    """移除图片背景（字节流版本）"""
    try:
        output_data = remove(input_bytes)
        return output_data
    except Exception as e:
        raise Exception(f"背景移除失败: {str(e)}")
