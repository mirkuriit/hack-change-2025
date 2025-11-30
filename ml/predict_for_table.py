import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from model import model, tokenizer


class CustomDataset(Dataset):
    def __init__(self, table_array, tokenizer, max_length=128, is_train=False):
        self.texts = table_array[:, 0]  # предполагаем, что текст в первом столбце
        self.is_train = is_train
        self.tokenizer = tokenizer
        self.max_length = max_length

        if self.is_train:
            self.labels = table_array[:, 1].astype(int)  # если есть метки

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoded = self.tokenizer(
            str(self.texts[idx]),
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )
        item = {
            "input_ids": encoded["input_ids"].squeeze(0),
            "attention_mask": encoded["attention_mask"].squeeze(0)
        }
        if self.is_train:
            item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def collate_fn_with_padding(batch):
    input_ids = torch.stack([x['input_ids'] for x in batch])
    attention_mask = torch.stack([x['attention_mask'] for x in batch])
    return {"input_ids": input_ids, "attention_mask": attention_mask}


def predict_for_table(model, tokenizer, path_to_table, path_to_save, max_length=128, batch_size=20):
    model.eval()
    device = next(model.parameters()).device

    table_df = pd.read_csv(path_to_table)
    table_array = np.array(table_df)

    val_dataset = CustomDataset(table_array, tokenizer, max_length=max_length, is_train=False)
    val_dataloader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, collate_fn=collate_fn_with_padding)

    all_predictions = []

    with torch.no_grad():
        for batch in val_dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = outputs.logits.argmax(dim=1)
            all_predictions.append(preds.cpu())

    all_predictions = torch.cat(all_predictions, dim=0).numpy()
    table_df['predictions'] = all_predictions
    table_df.to_csv(path_to_save, index=False)

predict_for_table(model, tokenizer, "./test_first_1000.csv", "predicted_table.csv")