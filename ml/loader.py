import pickle
import torch
from model import *

device = 'cpu'

with open('save_data_new.pkl', 'rb') as file:
    save_data = pickle.load(file)

word2ind = save_data[0]

model = BaseModel(
    hidden_dim=256,
    vocab_size=len(word2ind),
    num_classes=3,
    lstm_layers=2,
    aggregation_type='max+mean'
    ).to(device)

model.load_state_dict(torch.load("./full_model_state.pth", map_location=device))
model.to(device)