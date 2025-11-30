#!/bin/bash

download_from_gdrive() {
    local FILE_ID=$1
    local FILENAME=$2

    echo "Скачивание файла $FILENAME..."

    # Пробуем скачать через gdown
    if command -v gdown &> /dev/null; then
        gdown "https://drive.google.com/uc?id=$FILE_ID" -O "$FILENAME"
    else
        # Альтернативный метод через wget
        wget --no-check-certificate "https://drive.google.com/uc?export=download&id=$FILE_ID" -O "$FILENAME"
    fi
}