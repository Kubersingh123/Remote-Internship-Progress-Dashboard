from datetime import datetime


async def create_notification(db, user_id, title: str, message: str, type_: str):
    if not user_id:
        return

    await db.notifications.insert_one(
        {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": type_,
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
    )
