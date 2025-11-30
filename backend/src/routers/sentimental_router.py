from fastapi import APIRouter, Depends, HTTPException
from src.schemas.sentimental_schema import (
    SentimentalCreateFromOne, SentimentalGet, SentimentalCalculatedF1Get
)
from fastapi import UploadFile, File
from src.ml.predict_utils import model, predict, tokenizer, get_metrics_by_train
import pandas as pd

router = APIRouter(prefix="/predict-one", tags=["Sentimental"])


@router.post("/", response_model=SentimentalGet)
async def predict_one(
    data: SentimentalCreateFromOne,
):
    result = predict(model, tokenizer,text=data.text)

    return SentimentalGet(predicted_mark=result, text=data.text)


@router.post("/f1")
async def predict_f1(
    input_file: UploadFile = File(...),
):
    ### TODO добавить мл
    contents = await input_file.read()
    data = pd.read_csv(pd.io.common.BytesIO(contents))


    result = get_metrics_by_train(model, data)

    #return SentimentalCalculatedF1Get(f1=result)
    print(result)
    return {"f1-macro": sum([result.get(0).get("f1"), result.get(1).get("f1"), result.get(2).get("f1")]) / 3} | result