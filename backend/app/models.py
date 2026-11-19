
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Boolean
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def now_utc():
    return datetime.now(timezone.utc)


# USER MODEL
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(
        String(180), unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="patient")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc
    )

    readings = relationship(
        "HealthReading",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    assessments = relationship(
        "RiskAssessment",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# HEALTH READING MODEL
class HealthReading(Base):
    __tablename__ = "health_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True
    )

    heart_rate: Mapped[float] = mapped_column(Float)
    systolic_bp: Mapped[float] = mapped_column(Float)
    diastolic_bp: Mapped[float] = mapped_column(Float)
    spo2: Mapped[float] = mapped_column(Float)
    respiratory_rate: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    glucose: Mapped[float] = mapped_column(Float, default=100)

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc
    )

    patient = relationship(
        "User",
        back_populates="readings"
    )


# RISK ASSESSMENT MODEL
class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True
    )

    risk_score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String(20))

    model_version: Mapped[str] = mapped_column(
        String(60), default="synthetic-demo-v1"
    )

    explanation: Mapped[str] = mapped_column(Text, default="[]")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc
    )

    patient = relationship(
        "User",
        back_populates="assessments"
    )


# NOTIFICATION MODEL
class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True
    )

    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=now_utc
    )

    user = relationship(
        "User",
        back_populates="notifications"
    )
