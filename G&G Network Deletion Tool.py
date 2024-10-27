import os
import sys
import atexit
import multiprocessing
import subprocess
import tempfile
import urllib3
import eel
import requests
import zerorpc
from ChannelManager import *
from FileManager import *
import zmq

# Disable the InsecureRequestWarning
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


VERSION = "1.0.2"
VERSION_URL = (
    "https://github.com/raheem-tiamiyu/NetworkTool/raw/refs/heads/main/version.txt"
)

DOWNLOAD_URL = "https://github.com/raheem-tiamiyu/NetworkTool/raw/refs/heads/main/dist/G&G%20Network%20Deletion%20Tool.exe"


def delete_self():
    """Command to delete the executable"""
    # Create a temporary batch file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".bat") as bat_file:
        bat_file.write(
            f"""
        @echo off
        timeout /t 10 /nobreak > nul
        del "{sys.argv[0]}"
        del "%~f0"
        """.encode(
                "utf-8"
            )
        )
        bat_file_path = bat_file.name

        # Execute the batch file
    subprocess.Popen(bat_file_path, creationflags=subprocess.CREATE_NO_WINDOW)


@eel.expose
def check_for_version_update():
    print(sys.argv[0])
    try:
        response = requests.get(VERSION_URL, verify=False)
        latest_version = response.text.strip()
        print("latest_version", latest_version)
        print("current_version", VERSION)
        if latest_version != VERSION:
            print(latest_version == VERSION)
            download_new_version(latest_version)
            return latest_version
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
        atexit.register(delete_self)
        print(
            "Do not close this window! This window will close itself once update is complete"
        )
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

    # Connection PUB-REC
    # PUB
    addr = "tcp://0.0.0.0:8080"
    context = zmq.Context()
    pub_socket = context.socket(zmq.PUSH)
    pub_socket.bind(addr)
    print("Subscription address 8080")

    file_manager = FileManager()
    comms_channel = ChannelManager(pub_socket)
    file_manager.set_comms_channel(comms_channel)

    addr = "tcp://0.0.0.0:4242"
    s = zerorpc.Server(comms_channel)
    s.bind(addr)
    print("Listening on 4242")
    s.run()

    pub_socket.send_string("hi")
