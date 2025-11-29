import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.db.tables import User
from src.db.tables import SentimentalReport
from src.schemas.sentimental_report_schema import SentimentalReportCreate


class SentimentalReportService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: SentimentalReportCreate) -> SentimentalReport:
        report = SentimentalReport(
            filepath=data.filepath,
            user_id=data.user_id
        )
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def get(self, report_id: uuid.UUID) -> SentimentalReport | None:
        stmt = select(SentimentalReport).where(SentimentalReport.id == report_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: uuid.UUID):
        stmt = select(SentimentalReport).where(SentimentalReport.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()