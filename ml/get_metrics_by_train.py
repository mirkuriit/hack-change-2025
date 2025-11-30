import torch
from torch.utils.data import Dataset, DataLoader, TensorDataset
from tqdm.auto import tqdm
from sklearn.metrics import precision_recall_fscore_support
import pandas as pd
from model import model, tokenizer

device = 'cpu'
batch_size=32
max_length=128
text_col="text"
label_col="label"

class DataFrameTextDataset(Dataset):
    def __init__(self, df: pd.DataFrame, text_col="text", label_col="label"):
        self.texts = df[text_col].tolist()
        self.labels = df[label_col].tolist()

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return self.texts[idx], self.labels[idx]

def collate_batch(batch, tokenizer, max_length):
    texts, labels = zip(*batch)
    encoded = tokenizer(
        list(texts),
        padding="max_length",
        truncation=True,
        max_length=max_length,
        return_tensors="pt"
    )
    labels = torch.tensor(labels, dtype=torch.long)
    return encoded["input_ids"], encoded["attention_mask"], labels

def get_metrics_by_train(model, table):
    """
    Вычисляет precision, recall, f1 для каждого класса на DataFrame.
    """
    model.eval()
    dataset = DataFrameTextDataset(table, text_col=text_col, label_col=label_col)
    dataloader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=False,
        collate_fn=lambda b: collate_batch(b, tokenizer, max_length)
    )

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for input_ids, attention_mask, labels in tqdm(dataloader, desc="Evaluating"):
            input_ids = input_ids.to(device)
            attention_mask = attention_mask.to(device)
            labels = labels.to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            preds = torch.argmax(outputs.logits, dim=1)

            all_preds.extend(preds.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())

    precision, recall, f1, support = precision_recall_fscore_support(
        all_labels, all_preds, average=None
    )

    # Формируем словарь метрик для каждого класса
    metrics = {
        class_id: {
            "precision": float(precision[class_id]),
            "recall": float(recall[class_id]),
            "f1": float(f1[class_id]),
            "support": int(support[class_id])
        }
        for class_id in range(len(precision))
    }

    return metrics

metrics = get_metrics_by_train(model, table=pd.read_csv('train_first_1000.csv'))

print(metrics)