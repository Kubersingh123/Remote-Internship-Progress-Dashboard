from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_db, require_roles
from app.core.security import get_password_hash
from app.schemas.user import AdminResetPassword, AdminUserCreate, AdminUserUpdate, Role
from app.utils.serializers import serialize_document

router = APIRouter()


def _parse_object_id(value: str, label: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")


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
    user = await db.users.find_one({"_id": _parse_object_id(student_id, "student_id")}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    return serialize_document(user)


@router.post("/")
async def create_user(payload: AdminUserCreate, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN))):
    if payload.role not in [Role.MENTOR, Role.STUDENT]:
        raise HTTPException(status_code=400, detail="Only mentor or student can be created from this endpoint")

    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    mentor_object_id = None
    if payload.role == Role.STUDENT and payload.mentor_id:
        mentor = await db.users.find_one({"_id": _parse_object_id(payload.mentor_id, "mentor_id"), "role": Role.MENTOR.value})
        if not mentor:
            raise HTTPException(status_code=400, detail="Valid mentor is required for student")
        mentor_object_id = mentor["_id"]
    internship_object_id = None
    if payload.internship_id:
        internship = await db.internships.find_one({"_id": _parse_object_id(payload.internship_id, "internship_id")})
        if not internship:
            raise HTTPException(status_code=400, detail="Internship not found")
        internship_object_id = internship["_id"]

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "role": payload.role.value,
        "mentor_id": mentor_object_id,
        "internship_id": internship_object_id,
        "github_username": payload.github_username,
        "progress": 0,
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    created = await db.users.find_one({"_id": result.inserted_id}, {"password": 0})
    return serialize_document(created)


@router.patch("/{user_id}")
async def update_user(user_id: str, payload: AdminUserUpdate, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN))):
    user_object_id = _parse_object_id(user_id, "user_id")
    user = await db.users.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_none=True)

    if "email" in updates:
        email_owner = await db.users.find_one({"email": updates["email"]})
        if email_owner and str(email_owner["_id"]) != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")

    if "role" in updates:
        if updates["role"] not in [Role.ADMIN, Role.MENTOR, Role.STUDENT]:
            raise HTTPException(status_code=400, detail="Invalid role")
        updates["role"] = updates["role"].value

    if "password" in updates:
        updates["password"] = get_password_hash(updates["password"])

    if "mentor_id" in updates:
        mentor_id = updates["mentor_id"]
        if mentor_id:
            mentor = await db.users.find_one({"_id": _parse_object_id(mentor_id, "mentor_id"), "role": Role.MENTOR.value})
            if not mentor:
                raise HTTPException(status_code=400, detail="Mentor not found")
            updates["mentor_id"] = mentor["_id"]
        else:
            updates["mentor_id"] = None
    if "internship_id" in updates:
        internship_id = updates["internship_id"]
        if internship_id:
            internship = await db.internships.find_one({"_id": _parse_object_id(internship_id, "internship_id")})
            if not internship:
                raise HTTPException(status_code=400, detail="Internship not found")
            updates["internship_id"] = internship["_id"]
        else:
            updates["internship_id"] = None

    if updates.get("role") == Role.MENTOR.value:
        updates["mentor_id"] = None

    await db.users.update_one({"_id": user_object_id}, {"$set": updates})
    updated = await db.users.find_one({"_id": user_object_id}, {"password": 0})
    return serialize_document(updated)


@router.patch("/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    payload: AdminResetPassword,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN)),
):
    user = await db.users.find_one({"_id": _parse_object_id(user_id, "user_id")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") == Role.ADMIN.value:
        raise HTTPException(status_code=400, detail="Admin password reset not supported from this endpoint")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": get_password_hash(payload.new_password)}},
    )
    return {"message": "Password reset successfully"}


@router.delete("/{user_id}")
async def delete_user(user_id: str, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN))):
    user = await db.users.find_one({"_id": _parse_object_id(user_id, "user_id")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if str(user["_id"]) == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    if user.get("role") == Role.ADMIN.value:
        raise HTTPException(status_code=400, detail="Admin users cannot be deleted from this endpoint")

    if user.get("role") == Role.MENTOR.value:
        await db.users.update_many({"mentor_id": user["_id"]}, {"$set": {"mentor_id": None}})
        await db.tasks.update_many({"mentor_id": user["_id"]}, {"$set": {"mentor_id": None}})
        await db.reports.update_many({"mentor_id": user["_id"]}, {"$set": {"mentor_id": None}})

    if user.get("role") == Role.STUDENT.value:
        await db.tasks.delete_many({"student_id": user["_id"]})
        await db.reports.delete_many({"student_id": user["_id"]})
        await db.notifications.delete_many({"user_id": user["_id"]})

    await db.users.delete_one({"_id": user["_id"]})
    return {"message": "User deleted successfully"}
