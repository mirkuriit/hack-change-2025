from fastapi import APIRouter, Depends, HTTPException
from fastapi import UploadFile, File, Form
from fastapi.responses import FileResponse
from src.schemas.sentimental_report_schema import (
    SentimentalReportCreate, SentimentalReportRead, SentimentalReportReadPreds
)
from src.services.sentimental_report_service import SentimentalReportService
from src.services.user_service import UserService
from src.services.sentimental_report_service import get_report_service
from src.services.user_service import get_user_service

from src.config import config
from pathlib import Path
import uuid

router = APIRouter(prefix="/reports", tags=["Sentimental Reports"])


@router.post("/", response_model=SentimentalReportReadPreds)
async def create_report(
    input_file: UploadFile = File(...),
    user_id: uuid.UUID = Form(...),
    report_service: SentimentalReportService = Depends(get_report_service),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.get(user_id)

    report = SentimentalReportCreate(user_id=user_id, id=uuid.uuid4())

    await report_service.create(report)

    with open(Path(config.DATA_PATH) / (str(report.id) + ".csv"), "wb") as f:
        f.write(await input_file.read())

    ### TODO добавить мл
    prediction = {"text" : ["meow", "очень хуевыое обсулживание", "гойда"],
                         "label" : ["neutral", "positive", "negative"]}
    return SentimentalReportReadPreds(id=report.id,
                                      prediction=prediction)


@router.get("/csv/{report_id}", response_model=SentimentalReportRead)
async def download_report(
    report_id: uuid.UUID,
):
    filepath = Path(config.DATA_PATH) / (str(report_id) + ".csv")
    return FileResponse(path=filepath, filename='classification_results.csv', media_type='multipart/form-data')




@router.get("/", response_model=list[SentimentalReportRead])
async def get_reports(
    service: SentimentalReportService = Depends(get_report_service)
):
    reports = await service.get_all()
    return reports

@router.get("/{report_id}", response_model=SentimentalReportRead)
async def get_report(
    report_id: uuid.UUID,
    service: SentimentalReportService = Depends(get_report_service)
):
    report = await service.get(report_id)
    return report

@router.delete("/{report_id}", response_model=SentimentalReportRead)
async def delete_report(
    report_id: uuid.UUID,
    service: SentimentalReportService = Depends(get_report_service)
):
    report = await service.delete_by_id(report_id)
    return report