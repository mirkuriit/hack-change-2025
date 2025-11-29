from model import *
from tokenizer import *
import torch
import pickle


def predict(model, tokenizer, text, device='cpu'):
    tokens = tokenizer.encode(text)
    input_tensor = torch.tensor(tokens, dtype=torch.long).unsqueeze(0).to(device)  # batch=1

    model.to(device)
    model.eval()
    with torch.no_grad():
        output = model(input_tensor)

    return output.squeeze(0).argmax().item()


with open('save_data.pkl', 'rb') as file:
    save_data = pickle.load(file)

model, word2int = save_data

print(
    predict(model, MyTokenizer(word2int), "Отличный товар! Это просто замечательно")
)