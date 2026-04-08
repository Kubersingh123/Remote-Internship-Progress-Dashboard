from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


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
    github_username: str | None = None
    progress: int = 0
    created_at: datetime | None = None
