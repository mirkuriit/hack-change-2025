import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, ScalarResult
from src.db.tables import User
from src.schemas.user_schema import UserCreate
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.session import get_session
from sqlalchemy.orm import selectinload


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: UserCreate) -> User:
        user = User(
            login=data.login,
            hash_password=self._hash_password(data.password)
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get(self, user_id: uuid.UUID) -> User | None:
        query = (
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.sentimental_reports))  # Явная загрузка
        )
        user = await self.session.execute(query)
        if not user:
            raise HTTPException(404, "User not found")
        return user.scalar()

    async def get_by_login(self, login: str) -> User | None:
        query = select(User).where(User.login == login)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self) -> ScalarResult[User]:
        query = select(User)
        result = await self.session.execute(query)
        return result.scalars()

    def _hash_password(self, password: str) -> str:
        return password[::-1]


def get_user_service(
    session: AsyncSession = Depends(get_session),
) -> UserService:
    return UserService(session)