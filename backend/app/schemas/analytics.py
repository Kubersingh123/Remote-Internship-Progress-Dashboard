from pydantic import BaseModel


class TrendPoint(BaseModel):
    period: str
    completed: int
    pending: int
    total: int


class DepartmentPerformancePoint(BaseModel):
    department: str
    score: int
    projects: int


class TaskStatusPoint(BaseModel):
    name: str
    value: int


class StudentProgressPoint(BaseModel):
    name: str
    progress: int
    commits: int | None = None


class AnalyticsOverviewOut(BaseModel):
    summary: dict
    task_status_breakdown: list[TaskStatusPoint]
    student_progress: list[StudentProgressPoint]
    trend_points: list[TrendPoint]
    department_performance: list[DepartmentPerformancePoint]
