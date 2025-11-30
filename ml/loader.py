import pickle
import torch

device = 'cpu'

with open('save_data_new.pkl', 'rb') as file:
    save_data = pickle.load(file)

word2ind = save_data[0]

model = torch.load("full_model.pt", map_location=device, weights_only=False)
model.to(device)
model.eval()