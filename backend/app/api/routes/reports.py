from datetime import datetime
from pathlib import Path
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import get_db, require_roles
from app.core.config import settings
from app.schemas.report import FeedbackCreate, ReportCreate
from app.schemas.user import Role
from app.services.analytics_store import log_analytics_event
from app.services.notifications import create_notification
from app.services.summaries import generate_summary
from app.utils.serializers import serialize_document

router = APIRouter()


@router.get("/")
async def list_reports(
    student_id: str | None = None,
    mentor_id: str | None = None,
    search: str | None = None,
    week_label: str | None = None,
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
            raise HTTPException(status_code=403, detail="Students can only view their own reports")
        query["student_id"] = ObjectId(student_id)
    if mentor_id:
        if current_user["role"] == Role.MENTOR.value and mentor_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Mentors can only view their assigned reports")
        query["mentor_id"] = ObjectId(mentor_id)
    if week_label:
        query["week_label"] = week_label
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
        ]

    reports = []
    async for report in db.reports.find(query).sort("created_at", -1):
        reports.append(serialize_document(report))
    return reports


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_report(payload: ReportCreate, db=Depends(get_db), current_user=Depends(require_roles(Role.STUDENT))):
    mentor_id = ObjectId(current_user["mentor_id"]) if current_user.get("mentor_id") else None
    report_doc = {
        **payload.model_dump(),
        "student_id": ObjectId(current_user["id"]),
        "mentor_id": mentor_id,
        "attachments": [],
        "feedback": [],
        "summary": await generate_summary(payload.content),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.reports.insert_one(report_doc)
    await log_analytics_event(
        db,
        event_type="report_submitted",
        actor_id=current_user["id"],
        related_student_id=current_user["id"],
        related_mentor_id=current_user.get("mentor_id"),
        metadata={"week_label": payload.week_label},
    )
    await create_notification(
        db,
        user_id=mentor_id,
        title="Weekly report submitted",
        message=f"{current_user['name']} submitted {payload.week_label}.",
        type_="report_submitted",
    )
    created = await db.reports.find_one({"_id": result.inserted_id})
    return serialize_document(created)


@router.post("/{report_id}/upload")
async def upload_attachment(
    report_id: str,
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.STUDENT, Role.ADMIN)),
):
    report = await db.reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user["role"] == Role.STUDENT.value and str(report["student_id"]) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Students can only upload files to their own reports")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}-{file.filename}"
    path = upload_dir / filename
    path.write_bytes(await file.read())

    attachment = {
        "name": file.filename,
        "path": str(path),
        "content_type": file.content_type,
        "uploaded_at": datetime.utcnow(),
    }
    await db.reports.update_one({"_id": report["_id"]}, {"$push": {"attachments": attachment}})
    return {"message": "File uploaded", "attachment": attachment}


@router.post("/{report_id}/feedback")
async def add_feedback(
    report_id: str,
    payload: FeedbackCreate,
    db=Depends(get_db),
    current_user=Depends(require_roles(Role.MENTOR, Role.ADMIN)),
):
    report = await db.reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user["role"] == Role.MENTOR.value and str(report.get("mentor_id")) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Mentors can only provide feedback to assigned students")

    feedback = {
        "author_id": ObjectId(current_user["id"]),
        "author_name": current_user["name"],
        "comment": payload.comment,
        "created_at": datetime.utcnow(),
    }
    result = await db.reports.update_one({"_id": ObjectId(report_id)}, {"$push": {"feedback": feedback}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    await create_notification(
        db,
        user_id=report["student_id"],
        title="New mentor feedback",
        message=f"{current_user['name']} left feedback on {report['title']}.",
        type_="feedback",
    )
    await log_analytics_event(
        db,
        event_type="report_feedback",
        actor_id=current_user["id"],
        related_student_id=str(report["student_id"]),
        related_mentor_id=str(report.get("mentor_id")) if report.get("mentor_id") else None,
        metadata={"report_id": report_id},
    )
    return {"message": "Feedback added"}
