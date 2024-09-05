import os
import re
import time
import eel
import json
import base64
import requests
from io import BytesIO
import multiprocessing
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
from threading import Thread, Lock
from collections import defaultdict


VERSION = "1.0.0"
VERSION_URL = f"https://github.com/Tosvng/GGNDTVersioning/blob/03fbc5297cc590ea830d3317bf262bfc21f2df4d/version.txt"
found_files_lock = Lock()
misses_lock = Lock()
found_files = defaultdict(list)
files = []
misses = defaultdict(list)
search_keys = []
files_searched = 0
folders_searched = 0

currentPage = 0
FILES_PER_PAGE = 100


@eel.expose
def check_for_version_update():
    try:
        # print()
        response = requests.get(VERSION_URL)
        print(response)
    except Exception as e:
        print(e)


def get_exl_column_values(target_columns, columns):
    columns_values = []
    for column in target_columns:
        columns_values.append(columns[column].values.tolist())
    return columns_values


def hash_func(value):
    cleaned_string = re.sub(r"^\W+|\W+$", "", value)
    numeric_part = re.sub(r"\D", "", cleaned_string)

    def convert_letter_to_int(letter):
        return ord(letter.lower()) - ord("a") + 1

    letter_values = [
        convert_letter_to_int(letter) for letter in cleaned_string if letter.isalpha()
    ]
    combined_value = int(numeric_part) + sum(letter_values)

    hash_value = combined_value % 50
    return hash_value


def add_to_found_files(target_file, search_key):
    files.append(target_file)
    found_files[search_key].append(target_file)


def compare_names(search_key, lower_file, filename, dirpath, queue):
    if search_key in lower_file:
        target_file = os.path.join(dirpath, filename)
        add_message_to_queue(
            queue,
            {
                "found_file": {
                    "target_file": target_file,
                    "input_string": search_key,
                }
            },
        )


def add_message_to_queue(queue, message):
    with found_files_lock:
        queue.put(message)


def thread_for_each_column(columns_values, target_folder, queue):

    for dirpath, __, filenames in target_folder:
        for filename in filenames:
            add_message_to_queue(
                queue,
                {"report": {"file": f"Searching file {filename} in {dirpath}"}},
            )
            lower_filename = filename.lower()
            for input_string in columns_values:
                compare_names(input_string, lower_filename, filename, dirpath, queue)


def list_files(directory):
    return [os.path.join(directory, f) for f in os.listdir(directory)]


def sub_search_folders(folder, columns_values, target_columns, thread_name, queue):
    try:
        target_folder = os.walk(os.path.normpath(folder))
        add_message_to_queue(
            queue,
            {"report": {"file": f"Searching {os.path.normpath(folder)}"}},
        )
        print(f"{os.getpid()} searching {os.path.normpath(folder)}")
        column_threads = []
        for column_index in range(len(columns_values)):
            values_set = set(
                value.lower() for value in columns_values[column_index] if value != ""
            )
            print(f"{os.getpid()} Searching ", target_columns[column_index])
            thread = Thread(
                target=thread_for_each_column,
                args=(values_set, target_folder, queue),
            )
            column_threads.append(thread)
            thread.start()

            for thread in column_threads:
                thread.join()
    except Exception as e:
        print(e)


def search_folders(folder, columns_values, target_columns, thread_name, queue):
    # target_folder = os.walk(os.path.normpath(folder))

    # tests -- dont forget to handle if a file is in the base directory
    # print(os.getpid, " ended")
    # run a new process for each folder in the current directory
    try:
        directories = list_files(folder)
        dir_processes = []
        for _dir in directories:
            # if there are files in the directory check for a match in the column values
            if os.path.isfile(os.path.join(folder, _dir)):
                # Check each column
                for column_index in range(len(columns_values)):
                    add_message_to_queue(
                        queue,
                        {"report": {"file": f"Searching file {_dir} in {folder}"}},
                    )
                    print(f"{os.getpid()} Searching file {_dir} in {folder}")
                    # clean column values
                    values_set = set(
                        value.lower()
                        for value in columns_values[column_index]
                        if value != ""
                    )
                    lower_filename = _dir.lower()
                    for input_string in values_set:
                        compare_names(input_string, lower_filename, _dir, folder, queue)
            else:
                p = multiprocessing.Process(
                    target=sub_search_folders,
                    args=(
                        _dir,
                        columns_values,
                        target_columns,
                        directories.index(_dir),
                        queue,
                    ),
                )
                dir_processes.append(p)
                p.start()

        for process in dir_processes:
            process.join()
    except Exception as e:
        print(e)

    # --

    # print(str(thread_name) + " searching: ", target_folder)
    # print(os.getpid(), " started")

    # column_threads = []

    # for column_index in range(len(columns_values)):
    #     values_set = set(
    #         value.lower() for value in columns_values[column_index] if value != ""
    #     )
    #     print("Searching ", target_columns[column_index])
    #     thread = Thread(
    #         target=thread_for_each_column,
    #         args=(values_set, target_folder, queue),
    #     )
    #     column_threads.append(thread)
    #     thread.start()

    #     for thread in column_threads:
    #         thread.join()
    #     print(os.getpid, " ended")
    # print(os.getpid(), " ended")


@eel.expose
def delete_file(file_path, search_key):
    if os.path.exists(file_path):
        # hash_val = hash_func(file_path)
        index = found_files[search_key].index(file_path)
        if index > -1:
            if len(found_files[search_key]) - 1 > index:
                found_files[search_key] = (
                    found_files[search_key][:index]
                    + found_files[search_key][index + 1 :]
                )
            else:
                found_files[search_key] = found_files[search_key][:index]
        os.remove(file_path)
        print(f"{file_path} has been deleted.")
        eel.updateCount(len(files))
        return True


@eel.expose
def keep_file(file_path, search_key):
    # hash_val = hash_func(file_path)
    index = found_files[search_key].index(file_path)
    if index > -1:
        if len(found_files[search_key]) - 1 > index:
            found_files[search_key] = (
                found_files[search_key][:index] + found_files[search_key][index + 1 :]
            )
        else:
            found_files[search_key] = found_files[search_key][:index]
    eel.updateCount(len(files))


def clean_user_input(value):
    split_on_comma = value.split(",")
    clean_input = [item.strip() for item in split_on_comma if item]
    return clean_input


@eel.expose
def search(input_target_file, input_target_columns, input_target_folders):
    # start = time.time()
    queue = multiprocessing.Queue()

    print("Starting search")
    try:
        data = base64.b64decode(input_target_file)
        target_columns = clean_user_input(input_target_columns)
        folders = clean_user_input(input_target_folders)

        file = pd.read_excel(
            (BytesIO(data)), engine="openpyxl", dtype=str, usecols=target_columns
        ).fillna(value="")
        columns_as_list = get_exl_column_values(target_columns, file)

        folder_processes = []

        for folder in folders:
            p = multiprocessing.Process(
                target=search_folders,
                args=(
                    folder.strip(),
                    columns_as_list,
                    target_columns,
                    folders.index(folder),
                    queue,
                ),
            )
            folder_processes.append(p)
            p.start()

        # keep checking for new data in the queue while the processes are still alive
        while any([p.is_alive() for p in folder_processes]):
            if not queue.empty():
                data = queue.get()
                processQueueData(data)

        # Double check the queue after the processes are done
        while not queue.empty():
            data = queue.get()
            processQueueData(data)

        for process in folder_processes:
            process.join()
        # end = time.time()
        # print(end - start)

        global search_keys
        search_keys = list(found_files.keys())
        if len(search_keys) == 0:
            return json.dumps({"error": "No files found"})
        files_per_page = min(FILES_PER_PAGE, len(found_files[search_keys[0]]))

        return json.dumps(
            {
                "files": found_files[search_keys[0]][:files_per_page],
                "search_key": search_keys[0],
                "number_of_files_found": len(files),
                "page": 0,
                "total_page": len(search_keys),
                "has_more": len(found_files[search_keys[0]]) > files_per_page,
            }
        )

    except Exception as e:
        print(e)
        return json.dumps({"error": e}, default=str)


@eel.expose
def handleMorePage(_page):
    try:
        page = int(_page)
        files_per_page = min(FILES_PER_PAGE, len(found_files[search_keys[page]]))
        return json.dumps(
            {
                "files": found_files[search_keys[page]][:files_per_page],
                "search_key": search_keys[page],
                "number_of_files_found": len(files),
                "page": page,
                "total_page": len(search_keys),
                "files_length": len(found_files[search_keys[page]]),
                "has_more": len(found_files[search_keys[page]]) > FILES_PER_PAGE,
            }
        )
    except Exception as e:
        print(e)
        return json.dumps({"error": e}, default=str)


@eel.expose
def handleNextPage():
    try:
        global currentPage
        has_more = False
        nextPage = 1 + currentPage
        if nextPage > len(search_keys) - 1:
            currentPage = len(search_keys)
            return json.dumps({"error": "All done!"}, default=str)
        if len(found_files[search_keys[nextPage]]) > FILES_PER_PAGE:
            has_more = True
        currentPage = nextPage
        return json.dumps(
            {
                "files": found_files[search_keys[nextPage]][:FILES_PER_PAGE],
                "search_key": search_keys[nextPage],
                "number_of_files_found": len(files),
                "page": nextPage,
                "total_page": len(search_keys),
                "files_length": len(found_files[search_keys[nextPage]]),
                "has_more": has_more,
            }
        )
    except Exception as e:
        print(e)
        return json.dumps({"error": e}, default=str)


@eel.expose
def handleBackPage():
    global currentPage
    has_more = False
    files_per_page = FILES_PER_PAGE
    nextPage = currentPage - 1
    if nextPage <= -1:
        currentPage = -1
        return json.dumps({"error": "No data to show"}, default=str)
    currentPage = nextPage
    if len(found_files[search_keys[nextPage]]) > files_per_page:
        has_more = True
    currentPage = nextPage
    return json.dumps(
        {
            "files": found_files[search_keys[nextPage]][:files_per_page],
            "search_key": search_keys[nextPage],
            "number_of_files_found": len(files),
            "page": nextPage,
            "total_page": len(search_keys),
            "files_length": len(found_files[search_keys[nextPage]]),
            "has_more": has_more,
        }
    )


def processQueueData(data):
    if "report" in data:
        eel.progressUpdate(data["report"]["file"])
    elif "found_file" in data:
        add_to_found_files(
            data["found_file"]["target_file"],
            data["found_file"]["input_string"],
        )
        eel.updateCount(len(files))


if __name__ == "__main__":
    multiprocessing.freeze_support()
    eel.init("web")
    # search_tool = SearchTool(eel)
    eel.start("index.html", size=(1000, 600), port=3000)
