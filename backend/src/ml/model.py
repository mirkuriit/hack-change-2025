from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

device = 'cpu'

model = AutoModelForSequenceClassification.from_pretrained("src/ml/rubert_local").to(device)

state_dict = torch.load("src/ml/full_model_weights.pt", map_location=device)
model.load_state_dict(state_dict)
model.eval()

tokenizer = AutoTokenizer.from_pretrained("src/ml/rubert_tokenizer_local")