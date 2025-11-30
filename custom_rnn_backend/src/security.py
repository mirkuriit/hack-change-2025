import uuid
from fastapi import HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from src.config import config
from dataclasses import dataclass

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


@dataclass
class User:
    id: uuid.UUID


def create_access_token(data: dict) -> str:
    # data like {"sub" : user.id}
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(to_encode, config.JWT_SECRET, algorithm="HS256")
    return encode_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, config.JWT_SECRET, algorithms="HS256")
        print(payload.get("sub"))
        id: str = payload.get("sub")
        if id is None:
            raise HTTPException(status_code=404)
    except JWTError:
        raise HTTPException(status_code=401, detail="incorrect jwt")

    user = User(id=id)
    return user


async def get_authorized_user(current_user: User = Depends(get_current_user)):
    return current_user
