from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.schemas import SubscriptionCreate, SubscriptionResponse
from ..services.membership_service import (
    create_subscription,
    check_membership_status,
    get_user_subscriptions,
    cancel_subscription,
    get_membership_benefits
)
from .auth import get_current_user

router = APIRouter(prefix="/api/membership", tags=["会员"])


@router.post("/subscribe", response_model=SubscriptionResponse)
async def subscribe(
    subscription: SubscriptionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """订阅会员"""
    # TODO: 集成支付接口
    # 这里暂时直接开通，实际应该先调用支付接口

    new_subscription = create_subscription(
        db,
        current_user.id,
        subscription.subscription_type,
        subscription.membership_level
    )

    if not new_subscription:
        raise HTTPException(status_code=400, detail="订阅失败")

    return new_subscription


@router.get("/status")
async def get_status(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取会员状态"""
    user = check_membership_status(db, current_user.id)
    return {
        "membership_level": user.membership_level,
        "expires_at": user.membership_expires_at,
        "benefits": get_membership_benefits(user.membership_level)
    }


@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def get_subscriptions(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取订阅历史"""
    subscriptions = get_user_subscriptions(db, current_user.id)
    return subscriptions


@router.post("/cancel/{subscription_id}")
async def cancel(
    subscription_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消自动续费"""
    subscription = cancel_subscription(db, subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="订阅不存在")

    return {"message": "已取消自动续费"}


@router.get("/benefits")
async def get_benefits():
    """获取会员权益说明"""
    from ..models.database import MembershipLevel
    return {
        "free": get_membership_benefits(MembershipLevel.FREE),
        "vip": get_membership_benefits(MembershipLevel.VIP),
        "svip": get_membership_benefits(MembershipLevel.SVIP),
    }
