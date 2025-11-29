import torch
from sklearn.metrics import f1_score
from sklearn.metrics import precision_score, recall_score, f1_score

device = 'cpu'

def metrics_per_class(model, val_dataloader, device):
    model.eval()
    predictions = []
    targets = []

    with torch.no_grad():
        for batch in val_dataloader:
            input_ids = batch['input_ids'].to(device)
            labels = batch['label'].to(device)
            logits = model(input_ids)
            preds = logits.argmax(dim=1)

            predictions.append(preds)
            targets.append(labels)

    predictions = torch.cat(predictions).cpu().numpy()
    targets = torch.cat(targets).cpu().numpy()

    precision = precision_score(targets, predictions, average=None)
    recall = recall_score(targets, predictions, average=None)
    f1 = f1_score(targets, predictions, average=None)

    metrics_dict = {}
    num_classes = len(precision)
    for i in range(num_classes):
        metrics_dict[i] = {
            'precision': float(precision[i]),
            'recall': float(recall[i]),
            'f1': float(f1[i]),
        }

    return metrics_dict

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
