from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_db, require_roles
from app.schemas.internship import InternshipCreate, InternshipUpdate
from app.schemas.user import Role
from app.utils.serializers import serialize_document

router = APIRouter()


@router.get("/")
async def list_internships(db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR, Role.STUDENT))):
    internships = []
    async for internship in db.internships.find({}).sort("created_at", -1):
        internships.append(serialize_document(internship))
    return internships


@router.post("/")
async def create_internship(
    payload: InternshipCreate,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN)),
):
    existing = await db.internships.find_one({"domain": payload.domain, "title": payload.title})
    if existing:
        raise HTTPException(status_code=400, detail="Internship already exists")

    doc = payload.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await db.internships.insert_one(doc)
    created = await db.internships.find_one({"_id": result.inserted_id})
    return serialize_document(created)


@router.patch("/{internship_id}")
async def update_internship(
    internship_id: str,
    payload: InternshipUpdate,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN)),
):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided")

    result = await db.internships.update_one({"_id": ObjectId(internship_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Internship not found")

    updated = await db.internships.find_one({"_id": ObjectId(internship_id)})
    return serialize_document(updated)


@router.delete("/{internship_id}")
async def delete_internship(
    internship_id: str,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN)),
):
    internship = await db.internships.find_one({"_id": ObjectId(internship_id)})
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    await db.users.update_many({"internship_id": internship["_id"]}, {"$set": {"internship_id": None}})
    await db.internships.delete_one({"_id": internship["_id"]})
    return {"message": "Internship deleted successfully"}
