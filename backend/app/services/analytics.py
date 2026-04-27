from collections import Counter
from datetime import datetime, timedelta, timezone
import math

from bson import ObjectId

from app.services.github import fetch_github_activity
from app.services.analytics_store import upsert_analytics_snapshot

DEPARTMENTS = ["Engineering", "Design", "Marketing", "Product", "Data Science"]


def _department_from_task(task: dict) -> str:
    tags = [tag.lower() for tag in task.get("tags", [])]
    text = f"{task.get('title', '')} {task.get('description', '')}".lower()

    keyword_map = {
        "Engineering": ["backend", "api", "development", "engineering", "database", "frontend", "full-stack"],
        "Design": ["design", "ui", "ux", "figma", "wireframe"],
        "Marketing": ["marketing", "campaign", "seo", "content", "social"],
        "Product": ["product", "roadmap", "feature", "spec", "requirement"],
        "Data Science": ["data", "analytics", "ml", "model", "science"],
    }

    for department, keywords in keyword_map.items():
        if any(keyword in tags for keyword in keywords) or any(keyword in text for keyword in keywords):
            return department
    return "Engineering"


async def _build_trend_points(db, task_query: dict) -> list[dict]:
    now = datetime.now(timezone.utc)
    points = []
    window_starts = []
    for offset in range(5, -1, -1):
        start = now - timedelta(weeks=offset)
        aligned = start - timedelta(days=start.weekday())
        aligned = aligned.replace(hour=0, minute=0, second=0, microsecond=0)
        window_starts.append(aligned)

    tasks = []
    async for task in db.tasks.find(task_query, {"status": 1, "updated_at": 1}):
        tasks.append(task)

    for start in window_starts:
        end = start + timedelta(days=7)
        bucket_tasks = [
            task
            for task in tasks
            if task.get("updated_at")
            and start <= task["updated_at"].replace(tzinfo=timezone.utc) < end
        ]
        completed = sum(1 for task in bucket_tasks if task.get("status") == "done")
        total = len(bucket_tasks)
        pending = max(total - completed, 0)
        points.append(
            {
                "period": f"{start.strftime('%d %b')}",
                "completed": completed,
                "pending": pending,
                "total": total,
            }
        )
    return points


async def _build_department_performance(db, task_query: dict) -> list[dict]:
    counters: dict[str, dict[str, int]] = {department: {"projects": 0, "done": 0} for department in DEPARTMENTS}

    async for task in db.tasks.find(task_query, {"title": 1, "description": 1, "tags": 1, "status": 1}):
        department = _department_from_task(task)
        counters[department]["projects"] += 1
        if task.get("status") == "done":
            counters[department]["done"] += 1

    points = []
    for department in DEPARTMENTS:
        projects = counters[department]["projects"]
        done = counters[department]["done"]
        score = 0 if projects == 0 else int((done / projects) * 100)
        points.append(
            {
                "department": department,
                "score": score,
                "projects": projects,
            }
        )
    return points


def _calculate_percent_change(current: int | float, previous: int | float | None) -> dict:
    current_value = float(current) if isinstance(current, (int, float)) and math.isfinite(current) else 0.0
    previous_value = (
        float(previous) if isinstance(previous, (int, float)) and math.isfinite(previous) else None
    )

    if previous_value is None:
        return {
            "percent": 0,
            "trend": "flat",
            "previous": int(round(current_value)),
        }

    prev_value = previous_value
    if prev_value == 0:
        if current_value == 0:
            percent = 0.0
        else:
            percent = 100.0
    else:
        percent = ((current_value - prev_value) / abs(prev_value)) * 100

    rounded_percent = int(round(percent))
    if rounded_percent == 0:
        rounded_percent = 0

    if rounded_percent > 0:
        trend = "up"
    elif rounded_percent < 0:
        trend = "down"
    else:
        trend = "flat"

    return {
        "percent": rounded_percent,
        "trend": trend,
        "previous": int(round(prev_value)),
    }


async def _attach_realtime_change(db, scope: str, scope_id: str | None, data: dict) -> dict:
    previous_snapshot = await db.analytics_snapshots.find_one({"scope": scope, "scope_id": scope_id})
    previous_data = previous_snapshot.get("data", {}) if previous_snapshot else {}
    previous_summary = previous_data.get("summary", {})
    previous_breakdown = {
        item["name"]: item.get("value", 0) for item in previous_data.get("task_status_breakdown", [])
    }
    current_breakdown = {
        item["name"]: item.get("value", 0) for item in data.get("task_status_breakdown", [])
    }

    summary_change = {}
    for key, current_value in data.get("summary", {}).items():
        if isinstance(current_value, (int, float)):
            summary_change[key] = _calculate_percent_change(current_value, previous_summary.get(key))

    task_breakdown_change = {}
    for name, current_value in current_breakdown.items():
        task_breakdown_change[name] = _calculate_percent_change(current_value, previous_breakdown.get(name))

    data["summary_change"] = summary_change
    data["task_breakdown_change"] = task_breakdown_change
    return data


async def get_admin_analytics(db):
    total_students = await db.users.count_documents({"role": "student"})
    total_mentors = await db.users.count_documents({"role": "mentor"})
    total_reports = await db.reports.count_documents({})
    total_tasks = await db.tasks.count_documents({})

    student_progress = []
    async for student in db.users.find({"role": "student"}, {"name": 1, "progress": 1, "github_username": 1}):
        github = await fetch_github_activity(student.get("github_username"))
        student_progress.append(
            {
                "name": student["name"],
                "progress": student.get("progress", 0),
                "commits": github["commits"],
            }
        )

    task_status_counter = Counter()
    async for task in db.tasks.find({}, {"status": 1}):
        task_status_counter[task["status"]] += 1

    task_query = {}
    trend_points = await _build_trend_points(db, task_query)
    department_performance = await _build_department_performance(db, task_query)

    data = {
        "summary": {
            "total_students": total_students,
            "total_mentors": total_mentors,
            "total_reports": total_reports,
            "total_tasks": total_tasks,
        },
        "task_status_breakdown": [
            {"name": "To Do", "value": task_status_counter.get("todo", 0)},
            {"name": "In Progress", "value": task_status_counter.get("in_progress", 0)},
            {"name": "Done", "value": task_status_counter.get("done", 0)},
        ],
        "student_progress": student_progress,
        "trend_points": trend_points,
        "department_performance": department_performance,
    }
    data = await _attach_realtime_change(db, scope="admin", scope_id=None, data=data)
    await upsert_analytics_snapshot(db, scope="admin", scope_id=None, data=data)
    return data


async def get_mentor_analytics(db, mentor_id: str):
    mentor_object_id = ObjectId(mentor_id)

    total_students = await db.users.count_documents({"role": "student", "mentor_id": mentor_object_id})
    total_reports = await db.reports.count_documents({"mentor_id": mentor_object_id})
    total_tasks = await db.tasks.count_documents({"mentor_id": mentor_object_id})

    student_progress = []
    async for student in db.users.find(
        {"role": "student", "mentor_id": mentor_object_id},
        {"name": 1, "progress": 1, "github_username": 1},
    ):
        github = await fetch_github_activity(student.get("github_username"))
        student_progress.append(
            {
                "name": student["name"],
                "progress": student.get("progress", 0),
                "commits": github["commits"],
            }
        )

    task_status_counter = Counter()
    async for task in db.tasks.find({"mentor_id": mentor_object_id}, {"status": 1}):
        task_status_counter[task["status"]] += 1

    task_query = {"mentor_id": mentor_object_id}
    trend_points = await _build_trend_points(db, task_query)
    department_performance = await _build_department_performance(db, task_query)

    data = {
        "summary": {
            "total_students": total_students,
            "total_mentors": 1,
            "total_reports": total_reports,
            "total_tasks": total_tasks,
        },
        "task_status_breakdown": [
            {"name": "To Do", "value": task_status_counter.get("todo", 0)},
            {"name": "In Progress", "value": task_status_counter.get("in_progress", 0)},
            {"name": "Done", "value": task_status_counter.get("done", 0)},
        ],
        "student_progress": student_progress,
        "trend_points": trend_points,
        "department_performance": department_performance,
    }
    data = await _attach_realtime_change(db, scope="mentor", scope_id=mentor_id, data=data)
    await upsert_analytics_snapshot(db, scope="mentor", scope_id=mentor_id, data=data)
    return data


async def get_student_analytics(db, student_id: str):
    object_id = ObjectId(student_id)
    student = await db.users.find_one({"_id": object_id})
    report_count = await db.reports.count_documents({"student_id": object_id})
    github = await fetch_github_activity(student.get("github_username"))

    task_status = {"todo": 0, "in_progress": 0, "done": 0}
    async for task in db.tasks.find({"student_id": object_id}, {"status": 1}):
        task_status[task["status"]] += 1

    task_query = {"student_id": object_id}
    trend_points = await _build_trend_points(db, task_query)
    department_performance = await _build_department_performance(db, task_query)

    data = {
        "summary": {
            "progress": student.get("progress", 0),
            "reports_submitted": report_count,
            "github_commits": github["commits"],
            "total_tasks": sum(task_status.values()),
        },
        "task_status_breakdown": [
            {"name": "To Do", "value": task_status["todo"]},
            {"name": "In Progress", "value": task_status["in_progress"]},
            {"name": "Done", "value": task_status["done"]},
        ],
        "student_progress": [{"name": student["name"], "progress": student.get("progress", 0)}],
        "trend_points": trend_points,
        "department_performance": department_performance,
    }
    data = await _attach_realtime_change(db, scope="student", scope_id=student_id, data=data)
    await upsert_analytics_snapshot(db, scope="student", scope_id=student_id, data=data)
    return data
