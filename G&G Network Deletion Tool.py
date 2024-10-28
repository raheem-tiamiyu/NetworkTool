import os
from re import sub
import sys
import eel
import atexit
import requests
import multiprocessing
from pathlib import Path
from ChannelManager import *
from FileManager import *
import subprocess
import time
import tempfile


VERSION = "2.0.0"
VERSION_URL = (
    "https://github.com/raheem-tiamiyu/NetworkTool/raw/refs/heads/main/version.txt"
)

DOWNLOAD_URL = "https://github.com/raheem-tiamiyu/NetworkTool/raw/refs/heads/main/dist/G&G%20Network%20Deletion%20Tool.exe"
BASE_PATH = os.path.dirname(os.path.abspath(sys.argv[0]))


def do_update(exe_name, new_exe_name):
    # Command to delete the executable
    # Create a temporary batch file
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".py") as updater:
        updater.write(
            f"""
import os
import time
import shutil
import subprocess
import argparse


def apply_update(exe_name, new_exe_name):
    try:
        #if os.path.exist(exe_name + ".bak"):
        #    os.remove(exe_name + ".bak")
        os.rename(exe_name, exe_name + ".bak")
        shutil.move(new_exe_name, exe_name)
        
        restart_app(exe_name)
    except Exception as e:
        print(e)


def restart_app(exe_name):
    try:
        subprocess.Popen([exe_name])
    except Exception as e:
        print(e)
apply_update(r"{exe_name}", r"{new_exe_name}")
"""
        )
        updater_path = updater.name

    # Execute the batch file
    subprocess.Popen(["python", updater_path])


@eel.expose
def check_for_version_update():
    print(sys.argv[0])
    try:
        response = requests.get(VERSION_URL, verify=False)
        latest_version = response.text.strip()
        if latest_version != VERSION:
            eel.updateFound(1)
            new_exe = download_new_version(latest_version)
            do_update(
                os.path.join(BASE_PATH, "G&G Network Deletion Tool.exe"),
                os.path.join(BASE_PATH, new_exe),
            )

            sys.exit()
        return None

    except Exception as e:
        print(e)


def download_new_version(latest_version):
    # return "Download complete!"
    try:
        exename = f"G&G Network Deletion Tool_v{latest_version}.exe"
        response = requests.get(DOWNLOAD_URL, verify=False)
        with open(exename, "wb") as file:
            file.write(response.content)
        return exename
    except Exception as e:
        return f"Update failed: {e}"


def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    multiprocessing.set_start_method("spawn")
    web_folder = resource_path("web2")
    eel.init("web2/dist")
    file_manager = FileManager()
    comms_channel = ChannelManager()
    file_manager.set_comms_channel(comms_channel)
    eel.start("index.html", size=(1000, 1000), port=3000)
