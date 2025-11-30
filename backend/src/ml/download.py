import gdown

def download_folder(folder_id: str, output: str = "./downloaded"):
    """
    Скачивает папку Google Drive по её ID с помощью gdown.

    :param folder_id: ID папки Google Drive
    :param output: Путь куда скачать
    """
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    print(f"Downloading folder from: {url}")

    gdown.download_folder(
        url=url,
        output=output,
        quiet=False,
        use_cookies=False
    )

folder_id = "1FMI1DU-I_-SKcuS86Hot4BkNMQKEwA_q"
download_folder(folder_id)