from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.schemas import CreditRecharge, CreditTransactionResponse
from ..services.credit_service import (
    get_user_credits,
    add_credits,
    get_credit_history,
    CREDIT_COSTS
)
from .auth import get_current_user

router = APIRouter(prefix="/api/credits", tags=["积分"])


@router.get("/balance")
async def get_balance(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取积分余额"""
    credits = get_user_credits(db, current_user.id)
    return {"credits": credits}


@router.post("/recharge")
async def recharge_credits(
    recharge: CreditRecharge,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """充值积分"""
    # TODO: 集成支付接口
    # 这里暂时直接充值，实际应该先调用支付接口

    user = add_credits(db, current_user.id, recharge.amount, f"充值 - {recharge.payment_method}")
    if not user:
        raise HTTPException(status_code=400, detail="充值失败")

    return {
        "message": "充值成功",
        "credits": user.credits,
        "amount": recharge.amount
    }


@router.get("/history", response_model=List[CreditTransactionResponse])
async def get_history(
    limit: int = 50,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取积分使用历史"""
    transactions = get_credit_history(db, current_user.id, limit)
    return transactions


@router.get("/costs")
async def get_costs():
    """获取各项操作的积分消耗"""
    return {
        "costs": CREDIT_COSTS,
        "membership_discounts": {
            "free": 1.0,
            "vip": 0.8,
            "svip": 0.6
        }
    }
