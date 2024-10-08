import os
import sys
import eel
import atexit
import requests
import multiprocessing
from pathlib import Path
from ChannelManager import *
from FileManager import *


VERSION = "1.0.2 Viper"
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
            # for file in os.listdir():
            #     if file == os.path.basename(sys.argv[0]):
            #         print(os.path.basename(sys.argv[0]))

            download_new_version(latest_version)
            return latest_version

    except Exception as e:
        print(e)


def download_new_version(latest_version):
    # return "Download complete!"
    try:
        exename = f"G&G Network Deletion Tool_v{latest_version}.exe"
        response = requests.get(DOWNLOAD_URL, verify=False)
        with open(exename, "wb") as file:
            file.write(response.content)
        atexit.register(os.remove(sys.argv[0]))
        print("done")
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
