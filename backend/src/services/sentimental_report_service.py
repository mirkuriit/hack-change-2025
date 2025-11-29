import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.db.tables import User
from src.db.tables import SentimentalReport
from src.schemas.sentimental_report_schema import SentimentalReportCreate
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.session import get_session


class SentimentalReportService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: SentimentalReportCreate) -> SentimentalReport:
        report = SentimentalReport(
            id=data.id,
            filepath=str(data.user_id),
            user_id=data.user_id
        )
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report


    async def get(self, report_id: uuid.UUID) -> SentimentalReport | None:
        query = select(SentimentalReport).where(SentimentalReport.id == report_id)
        report = await self.session.execute(query)
        if not report:
            raise HTTPException(404, "Report not found")
        return report.scalar_one_or_none()


    async def get_all(self):
        query = select(SentimentalReport)
        reports = await self.session.execute(query)
        return reports.scalars()


    async def delete_by_id(self, report_id: uuid.UUID):
        query = select(SentimentalReport).where(SentimentalReport.id == report_id)
        report = await self.session.scalar(query)
        if report is None:
            raise HTTPException(404)
        await self.session.delete(report)
        await self.session.commit()
        return report


    async def get_by_id(self, report_if: uuid.UUID):
        query = select(SentimentalReport).where(SentimentalReport.id == report_if)
        report = await self.session.execute(query)
        return report.scalars().all()


def get_report_service(
    session: AsyncSession = Depends(get_session),
) -> SentimentalReportService:
    return SentimentalReportService(session)