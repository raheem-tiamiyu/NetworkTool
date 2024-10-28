from math import exp
import os
import time
import shutil
import subprocess
import argparse


def apply_update(exe_name, new_exe_name):
    try:
        os.remove(exe_name)
        shutil.move(new_exe_name, exe_name)
        restart_app(exe_name)
    except Exception as e:
        print(e)


def restart_app(exe_name):
    try:
        subprocess.Popen([exe_name])
    except Exception as e:
        print(e)


if __name__ == "__main__":
    try:
        time.sleep(2)
        parser = argparse.ArgumentParser(description="Update the network tool")
        parser.add_argument("exe_name", type=str)
        parser.add_argument("new_exe", type=str)
        args = parser.parse_args()
        apply_update(args.exe_name, args.new_exe)
    except Exception as e:
        print(e)
