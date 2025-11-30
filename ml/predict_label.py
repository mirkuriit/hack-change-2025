import torch
import numpy as np
from metrics import *
from torch.utils.data import DataLoader
import pandas as pd
from model import model, tokenizer

device = 'cpu'

def predict_label(model, tokenizer, texts, device="cpu", max_length=128):
    # Если передан одиночный текст, преобразуем в список
    single_input = False
    if isinstance(texts, str):
        texts = [texts]
        single_input = True

    encoded = tokenizer(
        texts,
        padding="max_length",
        truncation=True,
        max_length=max_length,
        return_tensors="pt"
    )

    input_ids = encoded["input_ids"].to(device)
    attention_mask = encoded["attention_mask"].to(device)

    model.eval()
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        preds = torch.argmax(logits, dim=1).cpu().tolist()

    if single_input:
        return preds[0]
    return preds


print(type(tokenizer))
text = "Этот продукт отличного качества и мне очень понравился."
pred_label = predict_label(model, tokenizer, text, device=device, max_length=512)
print("Предсказанная метка:", pred_label)