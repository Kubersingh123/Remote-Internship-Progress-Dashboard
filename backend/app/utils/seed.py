import asyncio
from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.db.mongodb import get_database


async def seed():
    db = await get_database()

    await db.users.delete_many({})
    await db.tasks.delete_many({})
    await db.reports.delete_many({})
    await db.notifications.delete_many({})

    mentor = {
        "name": "Maya Mentor",
        "email": "mentor@example.com",
        "password": get_password_hash("password123"),
        "role": "mentor",
        "progress": 0,
        "github_username": "octocat",
        "created_at": datetime.utcnow(),
    }
    mentor_result = await db.users.insert_one(mentor)

    student = {
        "name": "Sam Student",
        "email": "student@example.com",
        "password": get_password_hash("password123"),
        "role": "student",
        "mentor_id": mentor_result.inserted_id,
        "progress": 33,
        "github_username": "octocat",
        "created_at": datetime.utcnow(),
    }
    student_result = await db.users.insert_one(student)

    admin = {
        "name": "Ava Admin",
        "email": "admin@example.com",
        "password": get_password_hash("password123"),
        "role": "admin",
        "progress": 0,
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(admin)

    await db.tasks.insert_many(
        [
            {
                "title": "Finalize onboarding documentation",
                "description": "Write setup notes for future interns.",
                "student_id": student_result.inserted_id,
                "mentor_id": mentor_result.inserted_id,
                "status": "todo",
                "tags": ["docs", "writing"],
                "due_date": datetime.utcnow() + timedelta(days=2),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            {
                "title": "Build API integration",
                "description": "Connect frontend analytics cards to the FastAPI backend.",
                "student_id": student_result.inserted_id,
                "mentor_id": mentor_result.inserted_id,
                "status": "in_progress",
                "tags": ["api", "frontend"],
                "due_date": datetime.utcnow() + timedelta(days=4),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            {
                "title": "Ship report submission flow",
                "description": "Complete markdown report create and feedback flow.",
                "student_id": student_result.inserted_id,
                "mentor_id": mentor_result.inserted_id,
                "status": "done",
                "tags": ["reports", "full-stack"],
                "due_date": datetime.utcnow() - timedelta(days=1),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        ]
    )

    await db.reports.insert_one(
        {
            "title": "Week 4 Internship Update",
            "week_label": "Week 4",
            "content": "## Wins\n\n- Finished the dashboard layout.\n- Added JWT login flow.\n\n## Blockers\n\n- Need mentor feedback on analytics direction.",
            "highlights": ["Dashboard layout", "JWT login"],
            "blockers": ["Analytics review"],
            "student_id": student_result.inserted_id,
            "mentor_id": mentor_result.inserted_id,
            "attachments": [],
            "feedback": [
                {
                    "author_id": mentor_result.inserted_id,
                    "author_name": "Maya Mentor",
                    "comment": "Nice momentum. Focus next on task filtering and report polish.",
                    "created_at": datetime.utcnow(),
                }
            ],
            "summary": "Summary: The student finished the dashboard layout, added JWT login, and is waiting on analytics guidance.",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    )

    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
