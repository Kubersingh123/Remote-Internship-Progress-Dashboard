from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserOut
from app.utils.serializers import serialize_document

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db=Depends(get_db)):
    existing_user = await db.users.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "role": payload.role.value,
        "mentor_id": ObjectId(payload.mentor_id) if payload.mentor_id else None,
        "github_username": payload.github_username,
        "progress": 0,
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    created = await db.users.find_one({"_id": result.inserted_id}, {"password": 0})
    return serialize_document(created)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"], "role": user["role"]})
    user["id"] = str(user["_id"])
    user["mentor_id"] = str(user["mentor_id"]) if user.get("mentor_id") else None
    user.pop("password", None)
    return {"access_token": token, "token_type": "bearer", "user": serialize_document(user)}


@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    return current_user
