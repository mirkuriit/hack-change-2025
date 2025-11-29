import pandas as pd
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


from src.security import User, get_authorized_user
from src.config import config
from pathlib import Path
import uuid

router = APIRouter(prefix="/reports", tags=["Sentimental Reports"])


@router.post("/", response_model=SentimentalReportCreate)
async def create_report(
    input_file: UploadFile = File(...),
    report_service: SentimentalReportService = Depends(get_report_service),
    user_service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_authorized_user)
):
    user = await user_service.get(current_user.id)

    report = SentimentalReportCreate(user_id=current_user.id, id=uuid.uuid4())

    await report_service.create(report)

    ### TODO добавить мл
    with open(Path(config.DATA_PATH) / (str(report.id) + ".csv"), "wb") as f:
        f.write(await input_file.read())

    return report


@router.get("/csv/{report_id}", response_model=SentimentalReportRead)
async def download_report_csv(
    report_id: uuid.UUID,
    current_user: User = Depends(get_authorized_user)
):
    filepath = Path(config.DATA_PATH) / (str(report_id) + ".csv")
    return FileResponse(path=filepath, filename='classification_results.csv', media_type='multipart/form-data')

### TODO заменить на мл
def predict(data):
    return len(data) * [0]

def csv2json(path: Path):
    data = pd.read_csv(path)
    data["label"] = predict(data)
    #print(data)
    #print(data.to_dict("records"))
    return data.to_dict("records")

@router.get("/json/{report_id}", response_model=SentimentalReportReadPreds)
async def get_report_json(
    report_id: uuid.UUID,
    current_user: User = Depends(get_authorized_user)
):
    filepath = Path(config.DATA_PATH) / (str(report_id) + ".csv")
    predictions = csv2json(filepath)
    #print(predictions)
    report = SentimentalReportReadPreds(id=report_id, prediction=predictions)
    return report




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