from fastapi import APIRouter, Depends

from app.api.deps import get_db, require_roles
from app.schemas.user import Role
from app.services.analytics import get_admin_analytics, get_student_analytics

router = APIRouter()


@router.get("/overview")
async def overview(db=Depends(get_db), current_user=Depends(require_roles(Role.ADMIN, Role.MENTOR, Role.STUDENT))):
    if current_user["role"] == Role.STUDENT.value:
        return await get_student_analytics(db, current_user["id"])
    return await get_admin_analytics(db)
