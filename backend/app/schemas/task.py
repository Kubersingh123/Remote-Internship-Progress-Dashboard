from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = ""
    student_id: str | None = None
    student_ids: list[str] = []
    status: TaskStatus = TaskStatus.TODO
    due_date: datetime | None = None
    tags: list[str] = []


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    student_id: str | None = None
    status: TaskStatus | None = None
    due_date: datetime | None = None
    tags: list[str] | None = None
