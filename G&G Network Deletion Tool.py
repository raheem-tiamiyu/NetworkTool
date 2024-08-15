import os
import re
import time
import eel
import json
import multiprocessing
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
from threading import Thread, Lock
from collections import defaultdict


found_files_lock = Lock()
misses_lock = Lock()
found_files = defaultdict(list)
files = []
# found_files['til'] = ['red','yell', 'greer']
# found_files['til1'] = ['red1','yell1', 'greer1']
# found_files['til2'] = ['red2','yell2', 'greer2']
# files=['red','yell', 'greer','red1','yell1', 'greer1', 'red2','yell2', 'greer2']
misses = defaultdict(list)
all_search_key = []

currentPage = 0
FILES_PER_PAGE = 20

# file_path = 'MGM_2007.xlsx'
# folders = ["//encana.com/ecnshare/CGY/data_cdn/LockdownINTL", "//encana.com/ecnshare/CGY/data_cdn/LockdownCDN"]
# target_folder = os.walk(os.path.normpath("//encana.com/ecnshare/CGY/data_cdn/LockdownINTL"))
# id_list = columns['Seismic ID'].values.tolist()
# name_list = columns['Seismic Name'].values.tolist()

# columns_values = []


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


def thread_for_each_column(columns_values, target_folder, queue):
    target_file = None

    for dirpath, __, filenames in target_folder:
        for filename in filenames:
            lower_filename = filename.lower()
            if any([input_string in lower_filename for input_string in columns_values]):
                for input_string in columns_values:
                    if input_string in lower_filename:
                        with found_files_lock:
                            target_file = os.path.join(dirpath, filename)
                            add_to_found_files(target_file, input_string)
                            updateEelCount()
                            print(input_string, filename, target_file)

                        # queue.put(
                        #     {
                        #         "found_file": {
                        #             "target_file": target_file,
                        #             "input_string": input_string,
                        #         }
                        #     }
                        # )
                    # queue.put({"update_count"})
                    # eel.updateCount(len(files))
                    break


def search_folders(folder, columns_values, target_columns, thread_name, queue):
    target_folder = os.walk(os.path.normpath(folder))
    print(str(thread_name) + " searching: ", target_folder)
    column_threads = []

    for column_index in range(len(columns_values)):
        values_set = set(
            value.lower() for value in columns_values[column_index] if value != ""
        )
        print("Searching ", target_columns[column_index])
        thread = Thread(
            target=thread_for_each_column, args=(values_set, target_folder, queue)
        )
        column_threads.append(thread)
        thread.start()

        for thread in column_threads:
            thread.join()


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
    start = time.time()
    queue = multiprocessing.Queue()

    print("Starting search")
    try:
        target_columns = clean_user_input(input_target_columns)
        folders = clean_user_input(input_target_folders)

        file = pd.read_excel(
            (input_target_file), dtype=str, usecols=target_columns
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

        for process in folder_processes:
            process.join()
        end = time.time()
        print(end - start)

        global search_keys
        search_keys = list(found_files.keys())
        if len(search_keys) == 0:
            return json.dumps({"error": "No files found"})
        FILES_PER_PAGE = min(20, len(found_files[search_keys[0]]))

        return json.dumps(
            {
                "files": found_files[search_keys[0]][:FILES_PER_PAGE],
                "search_key": search_keys[0],
                "number_of_files_found": len(files),
                "page": 0,
                "total_page": len(search_keys),
                "has_more": len(found_files[search_keys[0]]) > 20,
            }
        )

    except Exception as e:
        return json.dumps({"error": e}, default=str)


@eel.expose
def handleMorePage(_page):
    page = int(_page)
    files_per_page = min(files_per_page, len(found_files[search_keys[page]]))
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


@eel.expose
def handleNextPage():
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
            "search_key": all_search_key[nextPage],
            "number_of_files_found": len(files),
            "page": nextPage,
            "total_page": len(all_search_key),
            "files_length": len(found_files[all_search_key[nextPage]]),
            "has_more": has_more,
        }
    )


@eel.expose
def handleBackPage():
    global currentPage
    has_more = False
    files_per_page = 20
    nextPage = currentPage - 1
    if nextPage <= -1:
        currentPage = -1
        return json.dumps({"error": "No data to show"}, default=str)
    currentPage = nextPage
    if len(found_files[all_search_key[nextPage]]) > files_per_page:
        has_more = True
    currentPage = nextPage
    return json.dumps(
        {
            "files": found_files[all_search_key[nextPage]][:files_per_page],
            "search_key": all_search_key[nextPage],
            "number_of_files_found": len(files),
            "page": nextPage,
            "total_page": len(all_search_key),
            "files_length": len(found_files[all_search_key[nextPage]]),
            "has_more": has_more,
        }
    )


def updateEelCount():
    eel.updateCount(len(files))


class SearchTool:
    def __init__(self, eel) -> None:
        self.eel = eel

    def updateEelCount(self):
        self.eel.updateCount(len(files))


if __name__ == "__main__":
    eel.init("web")
    # search_tool = SearchTool(eel)
    eel.start("index.html", size=(1000, 600), port=3100)
