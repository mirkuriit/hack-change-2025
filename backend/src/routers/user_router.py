from fastapi import APIRouter, Depends, HTTPException
from src.schemas.user_schema import UserCreate, UserRead, UserReadWithReport
from src.services.user_service import UserService
from src.services.user_service import  get_user_service
import uuid

from src.security import verify_password, create_access_token

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    user = await service.get_by_login(data.login)
    if user:
        raise HTTPException(400, "User already exists")
    return await service.create(data)


@router.post("/login")
async def login_in(
    login: str,
    password: str,
    service: UserService = Depends(get_user_service)
):
    user = await service.get_by_login(login)
    if user is None:
        raise HTTPException(404, detail="incorrect password or login")
    if verify_password(password, str(user.hash_password)):
        return {"access_token" : create_access_token({"sub" : str(user.id)})}
    else:
        raise HTTPException(401, detail="incorrect password or login")



@router.get("/{user_id}", response_model=UserReadWithReport)
async def get_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_service)
):
    user = await service.get(user_id)
    print(user)
    print(user.sentimental_reports)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.get("/", response_model=list[UserRead])
async def get_users(
    service: UserService = Depends(get_user_service)
):
    users = await service.get_all()
    return users