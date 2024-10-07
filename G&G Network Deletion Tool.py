import os
import sys
import eel
import requests
import multiprocessing
from pathlib import Path
from ChannelManager import *
from FileManager import *


VERSION = "1.0.1 Viper"
VERSION_URL = (
    "https://github.com/raheem-tiamiyu/NetworkTool/raw/refs/heads/main/version.txt"
)
# VERSION_URL = f"https://encana-my.sharepoint.com/:t:/r/personal/raheem_tiamiyu_encana_com/Documents/Documents/G%26G/seismic_finder/G%26GNDTversion.txt.txt?csf=1&web=1&e=Bje68N"

DOWNLOAD_URL = "https://github.com/raheem-tiamiyu/NetworkTool/raw/refs/heads/main/dist/G&G%20Network%20Deletion%20Tool.exe"


@eel.expose
def check_for_version_update():
    try:
        response = requests.get(VERSION_URL, verify=False)
        latest_version = response.text.strip()
        if latest_version != VERSION:
            print(latest_version == VERSION)
            latest_version = download_new_version()
            return latest_version

    except Exception as e:
        print(e)


def download_new_version():
    # return "Download complete!"
    try:
        response = requests.get(DOWNLOAD_URL, stream=True, verify=False)
        print("download", response)
        with open(
            os.path.join(
                os.path.dirname(Path(__file__).parent.absolute()),
                "G&G Network Deletion Tool.exe",
            ),
            "wb",
        ) as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        # with open(f"dist\G&G Network Deletion Tool.exe", "rb") as source_file:
        #     with open("filename.exe", "wb") as target_file:
        #         for chunk in source_file:
        #             target_file.write(chunk)
        return "Update complete!"
    except Exception as e:
        return f"Update failed: {e}"


def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    multiprocessing.set_start_method("spawn")
    web_folder = resource_path("web")
    eel.init("web")
    # search_tool = SearchTool(eel)
    file_manager = FileManager()
    comms_channel = ChannelManager()
    file_manager.set_comms_channel(comms_channel)
    eel.start("index.html", size=(1000, 1000), port=3000)
