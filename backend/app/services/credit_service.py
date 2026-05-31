from sqlalchemy.orm import Session
from ..models.database import User, CreditTransaction, TransactionType
from datetime import datetime


def get_user_credits(db: Session, user_id: int) -> float:
    user = db.query(User).filter(User.id == user_id).first()
    return user.credits if user else 0.0


def add_credits(db: Session, user_id: int, amount: float, description: str = "充值"):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    user.credits += amount

    transaction = CreditTransaction(
        user_id=user_id,
        amount=amount,
        transaction_type=TransactionType.RECHARGE,
        description=description
    )
    db.add(transaction)
    db.commit()
    db.refresh(user)
    return user


def consume_credits(db: Session, user_id: int, amount: float, description: str = "消耗"):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    if user.credits < amount:
        return None  # 积分不足

    user.credits -= amount

    transaction = CreditTransaction(
        user_id=user_id,
        amount=-amount,
        transaction_type=TransactionType.CONSUME,
        description=description
    )
    db.add(transaction)
    db.commit()
    db.refresh(user)
    return user


def get_credit_history(db: Session, user_id: int, limit: int = 50):
    return db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user_id
    ).order_by(CreditTransaction.created_at.desc()).limit(limit).all()


# 积分消耗标准
CREDIT_COSTS = {
    "text_to_image": 10.0,
    "image_to_image": 8.0,
    "remove_bg": 2.0,
    "resize": 0.5,
}


def get_credit_cost(operation: str, membership_level: str = "free") -> float:
    base_cost = CREDIT_COSTS.get(operation, 1.0)

    # 会员折扣
    if membership_level == "vip":
        return base_cost * 0.8  # VIP 8折
    elif membership_level == "svip":
        return base_cost * 0.6  # SVIP 6折

    return base_cost
