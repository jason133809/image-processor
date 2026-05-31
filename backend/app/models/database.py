from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class MembershipLevel(str, enum.Enum):
    FREE = "free"
    VIP = "vip"
    SVIP = "svip"


class SubscriptionType(str, enum.Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


class TransactionType(str, enum.Enum):
    RECHARGE = "recharge"
    CONSUME = "consume"
    GIFT = "gift"


class User(Base):
    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 积分
    credits = Column(Float, default=0.0)

    # 会员信息
    membership_level = Column(Enum(MembershipLevel), default=MembershipLevel.FREE)
    membership_expires_at = Column(DateTime, nullable=True)

    # 关系
    transactions = relationship("CreditTransaction", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    images = relationship("GeneratedImage", back_populates="user")


class CreditTransaction(Base):
    __tablename__ = "app_credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")


class Subscription(Base):
    __tablename__ = "app_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    subscription_type = Column(Enum(SubscriptionType), nullable=False)
    membership_level = Column(Enum(MembershipLevel), nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    auto_renew = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")


class GeneratedImage(Base):
    __tablename__ = "app_generated_images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    image_type = Column(String, nullable=False)
    prompt = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    credits_used = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="images")