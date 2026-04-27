from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class Role(str, Enum):
    ADMIN = "admin"
    MENTOR = "mentor"
    STUDENT = "student"


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    mentor_id: str | None = None
    internship_id: str | None = None
    github_username: str | None = None
    progress: int = 0
    created_at: datetime | None = None


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)
    role: Role
    mentor_id: str | None = None
    internship_id: str | None = None
    github_username: str | None = None


class AdminUserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6)
    role: Role | None = None
    mentor_id: str | None = None
    internship_id: str | None = None
    github_username: str | None = None


class AdminResetPassword(BaseModel):
    new_password: str = Field(min_length=6)
