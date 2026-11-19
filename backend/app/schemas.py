
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str
    password: str = Field(min_length=10, max_length=128)


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ReadingIn(BaseModel):
    heart_rate: float = Field(ge=25, le=250)
    systolic_bp: float = Field(ge=50, le=260)
    diastolic_bp: float = Field(ge=25, le=160)
    spo2: float = Field(ge=50, le=100)
    respiratory_rate: float = Field(ge=4, le=70)
    temperature: float = Field(ge=30, le=43)
    glucose: float = Field(ge=20, le=700)


class ReadingOut(ReadingIn):
    id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentOut(BaseModel):
    id: int
    risk_score: float
    risk_level: str
    model_version: str
    explanation: list[str]
    created_at: datetime


# NOTIFICATION OUTPUT SCHEMA
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
