from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_db, require_roles
from app.schemas.task import TaskCreate, TaskUpdate
from app.schemas.user import Role
from app.services.analytics_store import log_analytics_event
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
    if current_user["role"] == Role.MENTOR.value:
        query["mentor_id"] = ObjectId(current_user["id"])
    if student_id:
        if current_user["role"] == Role.STUDENT.value and student_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Students can only view their own tasks")
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
    target_student_ids = payload.student_ids[:] if payload.student_ids else []
    if payload.student_id:
        target_student_ids.append(payload.student_id)
    target_student_ids = list(dict.fromkeys(target_student_ids))

    if not target_student_ids:
        raise HTTPException(status_code=400, detail="At least one student is required")

    created_docs = []
    now = datetime.utcnow()
    mentor_object_id = ObjectId(current_user["id"])

    for student_id in target_student_ids:
        student = await db.users.find_one({"_id": ObjectId(student_id), "role": Role.STUDENT.value}, {"_id": 1})
        if not student:
            raise HTTPException(status_code=400, detail=f"Student not found: {student_id}")

        if current_user["role"] == Role.MENTOR.value:
            mentor_owned_student = await db.users.find_one(
                {"_id": student["_id"], "mentor_id": mentor_object_id, "role": Role.STUDENT.value},
                {"_id": 1},
            )
            if not mentor_owned_student:
                raise HTTPException(status_code=403, detail="Mentors can only create tasks for assigned students")

        task_doc = payload.model_dump(exclude={"student_id", "student_ids"})
        task_doc["student_id"] = student["_id"]
        task_doc["mentor_id"] = mentor_object_id
        task_doc["created_at"] = now
        task_doc["updated_at"] = now

        result = await db.tasks.insert_one(task_doc)
        created = await db.tasks.find_one({"_id": result.inserted_id})
        created_docs.append(created)

        await log_analytics_event(
            db,
            event_type="task_created",
            actor_id=current_user["id"],
            related_student_id=student_id,
            related_mentor_id=current_user["id"],
            metadata={"status": payload.status.value},
        )
        await calculate_student_progress(db, student_id)

    serialized = [serialize_document(doc) for doc in created_docs]
    if len(serialized) == 1:
        return serialized[0]
    return {"created": serialized, "count": len(serialized)}


@router.patch("/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR, Role.STUDENT))):
    existing = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user["role"] == Role.STUDENT.value and str(existing["student_id"]) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Students can only update their own tasks")
    if current_user["role"] == Role.MENTOR.value and str(existing.get("mentor_id")) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Mentors can only update assigned tasks")

    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if "student_id" in updates:
        updates["student_id"] = ObjectId(updates["student_id"])
    updates["updated_at"] = datetime.utcnow()

    result = await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    await log_analytics_event(
        db,
        event_type="task_updated",
        actor_id=current_user["id"],
        related_student_id=str(task["student_id"]),
        related_mentor_id=str(task.get("mentor_id")) if task.get("mentor_id") else None,
        metadata={"status": task.get("status")},
    )
    await calculate_student_progress(db, str(task["student_id"]))
    return serialize_document(task)
