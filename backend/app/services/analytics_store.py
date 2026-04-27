from datetime import datetime

from bson import ObjectId


async def log_analytics_event(
    db,
    event_type: str,
    actor_id: str | None = None,
    related_student_id: str | None = None,
    related_mentor_id: str | None = None,
    metadata: dict | None = None,
):
    event_doc = {
        "event_type": event_type,
        "actor_id": ObjectId(actor_id) if actor_id else None,
        "related_student_id": ObjectId(related_student_id) if related_student_id else None,
        "related_mentor_id": ObjectId(related_mentor_id) if related_mentor_id else None,
        "metadata": metadata or {},
        "created_at": datetime.utcnow(),
    }
    await db.analytics_events.insert_one(event_doc)


async def upsert_analytics_snapshot(db, scope: str, scope_id: str | None, data: dict):
    await db.analytics_snapshots.update_one(
        {"scope": scope, "scope_id": scope_id},
        {
            "$set": {
                "scope": scope,
                "scope_id": scope_id,
                "data": data,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )
