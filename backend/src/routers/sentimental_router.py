from fastapi import APIRouter, Depends, HTTPException
from src.schemas.sentimental_schema import (
    SentimentalCreateFromOne, SentimentalGet, SentimentalCalculatedF1Get
)
from fastapi import UploadFile, File
from src.services.sentimental_predictor import get_predict_sentimental_service, SentimentalPredictor

router = APIRouter(prefix="/predict-one", tags=["Sentimental"])


@router.post("/", response_model=SentimentalGet)
async def predict_one(
    data: SentimentalCreateFromOne,
    predict_service: SentimentalPredictor = Depends(get_predict_sentimental_service)
):
    ### TODO добавить мл
    result = predict_service.predict_from_one(data.text)

    return SentimentalGet(predicted_mark=result, text=data.text)


@router.post("/f1", response_model=SentimentalCalculatedF1Get)
async def predict_f1(
    input_file: UploadFile = File(...),
    predict_service: SentimentalPredictor = Depends(get_predict_sentimental_service)
):
    ### TODO добавить мл
    result = predict_service.predict_f1(input_file)

    return SentimentalCalculatedF1Get(f1=result)