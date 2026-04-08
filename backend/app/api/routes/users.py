from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_db, require_roles
from app.schemas.user import Role
from app.utils.serializers import serialize_document

router = APIRouter()


@router.get("/")
async def list_users(
    role: str | None = None,
    search: str | None = None,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR)),
):
    query: dict = {}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    users = []
    async for user in db.users.find(query, {"password": 0}).sort("created_at", -1):
        users.append(serialize_document(user))
    return users


@router.get("/students/{student_id}")
async def get_student(student_id: str, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR, Role.STUDENT))):
    user = await db.users.find_one({"_id": ObjectId(student_id)}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    return serialize_document(user)
