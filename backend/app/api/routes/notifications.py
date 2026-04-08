from bson import ObjectId
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, get_db
from app.utils.serializers import serialize_document

router = APIRouter()


@router.get("/")
async def list_notifications(db=Depends(get_db), current_user=Depends(get_current_user)):
    items = []
    async for notification in db.notifications.find({"user_id": ObjectId(current_user["id"])}).sort("created_at", -1).limit(20):
        items.append(serialize_document(notification))
    return items


@router.patch("/{notification_id}/read")
async def mark_notification_read(notification_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(current_user["id"])},
        {"$set": {"is_read": True}},
    )
    return {"message": "Notification marked as read"}
