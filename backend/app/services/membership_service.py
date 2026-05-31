from sqlalchemy.orm import Session
from ..models.database import User, Subscription, MembershipLevel, SubscriptionType, CreditTransaction, TransactionType
from datetime import datetime, timedelta


def create_subscription(
    db: Session,
    user_id: int,
    subscription_type: SubscriptionType,
    membership_level: MembershipLevel
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # 计算订阅时长
    if subscription_type == SubscriptionType.MONTHLY:
        duration = timedelta(days=30)
        gift_credits = 50.0 if membership_level == MembershipLevel.VIP else 150.0
    else:  # YEARLY
        duration = timedelta(days=365)
        gift_credits = 600.0 if membership_level == MembershipLevel.VIP else 2000.0

    start_date = datetime.utcnow()
    end_date = start_date + duration

    # 创建订阅记录
    subscription = Subscription(
        user_id=user_id,
        subscription_type=subscription_type,
        membership_level=membership_level,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
        auto_renew=False
    )
    db.add(subscription)

    # 更新用户会员信息
    user.membership_level = membership_level
    user.membership_expires_at = end_date

    # 赠送积分
    user.credits += gift_credits
    gift_transaction = CreditTransaction(
        user_id=user_id,
        amount=gift_credits,
        transaction_type=TransactionType.GIFT,
        description=f"会员订阅赠送积分"
    )
    db.add(gift_transaction)

    db.commit()
    db.refresh(subscription)
    return subscription


def check_membership_status(db: Session, user_id: int):
    """检查并更新会员状态"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # 检查会员是否过期
    if user.membership_expires_at and user.membership_expires_at < datetime.utcnow():
        user.membership_level = MembershipLevel.FREE
        user.membership_expires_at = None
        db.commit()

    return user


def get_user_subscriptions(db: Session, user_id: int):
    return db.query(Subscription).filter(
        Subscription.user_id == user_id
    ).order_by(Subscription.created_at.desc()).all()


def cancel_subscription(db: Session, subscription_id: int):
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if subscription:
        subscription.auto_renew = False
        db.commit()
    return subscription


# 会员权益配置
MEMBERSHIP_BENEFITS = {
    MembershipLevel.FREE: {
        "credit_discount": 1.0,
        "max_image_size": "1024x1024",
        "batch_processing": False,
        "priority_queue": False,
        "hd_quality": False,
    },
    MembershipLevel.VIP: {
        "credit_discount": 0.8,
        "max_image_size": "1792x1024",
        "batch_processing": True,
        "priority_queue": True,
        "hd_quality": True,
    },
    MembershipLevel.SVIP: {
        "credit_discount": 0.6,
        "max_image_size": "1792x1024",
        "batch_processing": True,
        "priority_queue": True,
        "hd_quality": True,
    }
}


def get_membership_benefits(membership_level: MembershipLevel):
    return MEMBERSHIP_BENEFITS.get(membership_level, MEMBERSHIP_BENEFITS[MembershipLevel.FREE])
