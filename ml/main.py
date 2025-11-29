from model import *
from tokenizer import *
import torch
import pickle
import numpy as np
from metrics import *
from torch.utils.data import DataLoader
from dataset import *
import pandas as pd

device = 'cpu'

def predict(model, tokenizer, text, device='cpu'):
    tokens = tokenizer.encode(text)
    input_tensor = torch.tensor(tokens, dtype=torch.long).unsqueeze(0).to(device)  # batch=1

    model.to(device)
    model.eval()
    with torch.no_grad():

        output = model(input_tensor)

    return output.squeeze(0).argmax().item()

def get_metrics_by_train(model, table):
    table = np.array(table)

    test_dataset = CustomDataset(table)

    test_dataloader = DataLoader(
        test_dataset, shuffle=True, collate_fn=collate_fn_with_padding, batch_size=20)

    return metrics_per_class(model, test_dataloader, device)


def predict_for_table(model, path_to_table, path_to_save):
    table_df = pd.read_csv(path_to_table)
    table = np.array(table_df)

    val_dataset = CustomDataset(table, is_train=False)

    val_dataloader = DataLoader(
        val_dataset, shuffle=True, collate_fn=collate_fn_with_padding, batch_size=20)

    predictions = []
    target = []
    model.eval()

    with torch.no_grad():
        for batch in val_dataloader:
            logits = model(batch['input_ids'].to(device))
            predictions.append(logits.argmax(dim=1))

    predictions = torch.cat(predictions, dim=0)

    table_df['predictions'] = predictions

    table_df.to_csv(path_to_save, index=False)


with open('save_data.pkl', 'rb') as file:
    save_data = pickle.load(file)

model, word2ind = save_data
model.to('cpu')

print(
    predict(model, tokenizer, "Отличный товар! Так и тянеть сьесть!")
)
print(
    get_metrics_by_train(model, pd.read_csv('train_first_1000.csv'))
)
# predict_for_table(model, "./test_first_1000.csv", "predicted_table")
