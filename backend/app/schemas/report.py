from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    week_label: str
    content: str = Field(min_length=20)
    highlights: list[str] = []
    blockers: list[str] = []


class FeedbackCreate(BaseModel):
    comment: str = Field(min_length=3)


class AttachmentOut(BaseModel):
    name: str
    path: str
    content_type: str | None = None
    uploaded_at: datetime


class FeedbackOut(BaseModel):
    author_id: str | None = None
    author_name: str
    comment: str
    created_at: datetime
