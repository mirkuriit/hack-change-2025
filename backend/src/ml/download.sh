#!/bin/bash

download_from_gdrive() {
    local FILE_ID=$1
    local FILENAME=$2

    echo "Скачивание файла $FILENAME..."

    if command -v gdown &> /dev/null; then
        gdown "https://drive.google.com/uc?id=$FILE_ID" -O "$FILENAME"
    else
        wget --no-check-certificate "https://drive.google.com/uc?export=download&id=$FILE_ID" -O "$FILENAME"
    fi
}

# Использование аргументов командной строки
if [ $# -ne 2 ]; then
    echo "Использование: $0 <file_id> <output_filename>"
    echo "Пример: $0 1ABC123def456GHI789jkl model.zip"
    exit 1
fi

FILE_ID=$1
FILENAME=$2

download_from_gdrive "$FILE_ID" "$FILENAME"