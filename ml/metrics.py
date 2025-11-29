import torch
from sklearn.metrics import f1_score

device = 'cpu'

def F1macro(model, val_dataloader) -> float:
    predictions = []
    target = []
    model.eval()

    with torch.no_grad():
        for batch in val_dataloader:
            logits = model(batch['input_ids'].to(device))
            predictions.append(logits.argmax(dim=1))
            target.append(batch['label'].to(device))

    predictions = torch.cat(predictions).cpu().numpy()
    target = torch.cat(target).cpu().numpy()

    macro_f1 = f1_score(predictions, target, average='macro')

    return macro_f1


def accuracy(model, val_dataloader):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for batch in val_dataloader:
            inputs = batch['input_ids'].to(device)
            labels = batch['label'].to(device)

            outputs = model(inputs)

            _, predicted = torch.max(outputs.data, 1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    return correct / total