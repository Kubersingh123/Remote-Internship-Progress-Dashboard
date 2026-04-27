from datetime import datetime

from pydantic import BaseModel, Field


class InternshipCreate(BaseModel):
    domain: str = Field(min_length=2, max_length=120)
    title: str = Field(min_length=2, max_length=160)
    description: str = ""
    duration_weeks: int = Field(default=8, ge=1, le=52)
    is_active: bool = True


class InternshipUpdate(BaseModel):
    domain: str | None = None
    title: str | None = None
    description: str | None = None
    duration_weeks: int | None = Field(default=None, ge=1, le=52)
    is_active: bool | None = None


class InternshipOut(BaseModel):
    id: str
    domain: str
    title: str
    description: str
    duration_weeks: int
    is_active: bool
    created_at: datetime | None = None
