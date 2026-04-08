from collections import Counter

from bson import ObjectId

from app.services.github import fetch_github_activity


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

    return {
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
    }


async def get_student_analytics(db, student_id: str):
    object_id = ObjectId(student_id)
    student = await db.users.find_one({"_id": object_id})
    report_count = await db.reports.count_documents({"student_id": object_id})
    github = await fetch_github_activity(student.get("github_username"))

    task_status = {"todo": 0, "in_progress": 0, "done": 0}
    async for task in db.tasks.find({"student_id": object_id}, {"status": 1}):
        task_status[task["status"]] += 1

    return {
        "summary": {
            "progress": student.get("progress", 0),
            "reports_submitted": report_count,
            "github_commits": github["commits"],
        },
        "task_status_breakdown": [
            {"name": "To Do", "value": task_status["todo"]},
            {"name": "In Progress", "value": task_status["in_progress"]},
            {"name": "Done", "value": task_status["done"]},
        ],
        "student_progress": [{"name": student["name"], "progress": student.get("progress", 0)}],
    }
