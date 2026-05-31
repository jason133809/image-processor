from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class MembershipLevel(str, Enum):
    FREE = "free"
    VIP = "vip"
    SVIP = "svip"


class SubscriptionType(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


# 用户相关
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    credits: float
    membership_level: MembershipLevel
    membership_expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# 积分相关
class CreditRecharge(BaseModel):
    amount: float
    payment_method: str  # alipay, wechat


class CreditTransactionResponse(BaseModel):
    id: int
    amount: float
    transaction_type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# 会员相关
class SubscriptionCreate(BaseModel):
    subscription_type: SubscriptionType
    membership_level: MembershipLevel
    payment_method: str


class SubscriptionResponse(BaseModel):
    id: int
    subscription_type: SubscriptionType
    membership_level: MembershipLevel
    start_date: datetime
    end_date: datetime
    is_active: bool
    auto_renew: bool

    class Config:
        from_attributes = True


# 图片生成相关
class TextToImageRequest(BaseModel):
    prompt: str
    size: str = "1024x1024"  # 1024x1024, 1792x1024, 1024x1792
    quality: str = "standard"  # standard, hd


class ImageToImageRequest(BaseModel):
    prompt: str
    strength: float = 0.8  # 0.0-1.0


class ResizeRequest(BaseModel):
    width: int
    height: int
    maintain_aspect_ratio: bool = True


class ImageResponse(BaseModel):
    image_url: str
    credits_used: float
    message: str
