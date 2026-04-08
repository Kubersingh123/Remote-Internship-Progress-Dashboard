from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_db, require_roles
from app.schemas.task import TaskCreate, TaskUpdate
from app.schemas.user import Role
from app.services.progress import calculate_student_progress
from app.utils.serializers import serialize_document

router = APIRouter()


@router.get("/")
async def list_tasks(
    student_id: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)),
):
    query: dict = {}
    if current_user["role"] == Role.STUDENT.value:
        query["student_id"] = ObjectId(current_user["id"])
    if student_id:
        query["student_id"] = ObjectId(student_id)
    if status_filter:
        query["status"] = status_filter
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$elemMatch": {"$regex": search, "$options": "i"}}},
        ]

    tasks = []
    async for task in db.tasks.find(query).sort("updated_at", -1):
        tasks.append(serialize_document(task))
    return tasks


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR))):
    task_doc = payload.model_dump()
    task_doc["student_id"] = ObjectId(payload.student_id)
    task_doc["mentor_id"] = ObjectId(current_user["id"])
    task_doc["created_at"] = datetime.utcnow()
    task_doc["updated_at"] = datetime.utcnow()
    result = await db.tasks.insert_one(task_doc)
    await calculate_student_progress(db, payload.student_id)
    created = await db.tasks.find_one({"_id": result.inserted_id})
    return serialize_document(created)


@router.patch("/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR, Role.STUDENT))):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if "student_id" in updates:
        updates["student_id"] = ObjectId(updates["student_id"])
    updates["updated_at"] = datetime.utcnow()

    result = await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    await calculate_student_progress(db, str(task["student_id"]))
    return serialize_document(task)
