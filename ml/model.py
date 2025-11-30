from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

device = 'cpu'

model = AutoModelForSequenceClassification.from_pretrained("./rubert_local").to(device)

state_dict = torch.load("./full_model_weights.pt", map_location=device)
model.load_state_dict(state_dict)
model.eval()

tokenizer = AutoTokenizer.from_pretrained("./rubert_tokenizer_local")