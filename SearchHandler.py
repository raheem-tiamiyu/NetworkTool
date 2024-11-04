import base64
from io import BytesIO
import multiprocessing
import os
import time

import pandas as pd
from ErrorHandler import *


class SearchHandler:
    def __init__(self, file_manager) -> None:
        self.file_manager = file_manager
        self.error_handler = ErrorHandler()
        self.found_files_lock = multiprocessing.Lock()
        self.comms_lock = multiprocessing.Lock()

    def do_multiprocess_search(self, search_keys, specified_columns, target_folders):
        queue = multiprocessing.Queue()
        try:
            # PREP: get the search keys, clean user input
            folder_processes = []

            search_keys = self.get_search_keys_from_user_input(
                search_keys, specified_columns
            )

            tokenized_target_folder = self.tokenize_user_input(target_folders)

            #  Create processes
            for folder in tokenized_target_folder:
                process = multiprocessing.Process(
                    target=self.folder_search_process,
                    args=(search_keys, folder, queue),
                )
                folder_processes.append(process)
                process.start()

            # handle processing messages in the queue
            while any([p.is_alive() for p in folder_processes]):
                if not queue.empty():
                    data = queue.get()
                    self.processQueueData(data)

            # Double check the queue after the processes are done
            while not queue.empty():
                data = queue.get()
                self.processQueueData(data)

            # wait for all processes to finish
            for process in folder_processes:
                process.join()

        except Exception as e:
            self.error_handler.show_error_message(
                message=f"An unknown error occurred while the search handler was searching. {e}"
            )

    def get_search_keys_from_user_input(self, search_keys, specified_columns):
        try:
            is_file_path = False
            is_uploaded_file = False
            # check if it a file path,
            if os.path.isfile(search_keys):
                is_file_path = True
                target_columns = self.tokenize_user_input(specified_columns)
                file = pd.read_excel(
                    (search_keys), dtype=str, usecols=target_columns
                ).fillna(value="")
                search_keys = self.get_exl_column_values(file, target_columns)

            # if not try to decode it,
            elif not is_file_path:
                try:
                    target_columns = self.tokenize_user_input(specified_columns)
                    raw_bytes = base64.b64decode(search_keys)
                    file = pd.read_excel(
                        (BytesIO(raw_bytes)),
                        engine="openpyxl",
                        dtype=str,
                        usecols=target_columns,
                    ).fillna(value="")
                    search_keys = self.get_exl_column_values(file, target_columns)

                except Exception as e:
                    search_keys = self.tokenize_user_input(search_keys)

            # clean the search keys
            search_keys = set(value.lower() for value in search_keys if value != "")

            return search_keys
        except Exception as e:
            self.error_handler.show_error_message(
                message=f"Search handler could not process the user input. {e}"
            )

    def get_exl_column_values(self, file, specified_columns):
        try:
            columns_values = []
            for column in specified_columns:
                columns_values += file[column].values.tolist()
            return columns_values
        except Exception as e:
            self.error_handler.show_error_message(
                message=f"Search handler could not get the specified columns. {e}"
            )

    def tokenize_user_input(self, user_input):
        split_on_comma = user_input.split(",")
        clean_input = [item.strip() for item in split_on_comma if item]
        return clean_input

    def folder_search_process(self, search_keys, folder, queue):
        # print(os.getpid(), " started -- level 1")
        directory_processes = []
        try:
            #  Get the contents of the directory. 1. Each folder will get its own process. 2. Files are checked against the file search_keys
            folder_content = self.list_all_contents_in_folder(folder)

            for file in folder_content:
                if os.path.isfile(os.path.join(folder, file)):
                    # check it against the keys
                    with self.comms_lock:
                        queue.put(
                            {
                                "report": {
                                    "folder": f"{folder}",
                                    "file": f"{file}",
                                }
                            }
                        )
                    for key in search_keys:
                        self.compare_names(key, file.lower(), file, folder, queue)
                else:
                    process = multiprocessing.Process(
                        target=self.sub_folder_search_process,
                        args=(search_keys, file, queue),
                    )
                    directory_processes.append(process)
                    process.start()

            for process in directory_processes:
                process.join()

        except Exception as e:
            # print(e)
            return self.error_handler.show_error_message(
                message=f"An error occurred while trying to search the first directory\n\n{e}"
            )

    def sub_folder_search_process(self, search_keys, folder, queue):
        try:
            # print(os.getpid(), " started -- level 2")
            target_folder = os.walk(os.path.normpath(folder))
            queue.put({"report": {"folder": f"{target_folder}", "file": ""}})

            for dirpath, __, filenames in target_folder:
                for filename in filenames:
                    with self.comms_lock:
                        queue.put(
                            {
                                "report": {
                                    "folder": f"{dirpath}",
                                    "file": f"{filename}",
                                }
                            }
                        )
                    lower_filename = filename.lower()
                    for key in search_keys:
                        self.compare_names(
                            key, lower_filename, filename, dirpath, queue
                        )

        except Exception as e:
            # print(e)
            return self.error_handler.show_error_message(
                message=f"An error occurred while trying to search the Second level directory\n\n{e}"
            )

    # this is doing too much
    def compare_names(self, search_key, lower_file, filename, folder, queue):
        if search_key in lower_file:
            target_file = os.path.join(folder, filename)
            with self.found_files_lock:
                queue.put(
                    {
                        "found_file": {
                            "target_file": target_file,
                            "input_string": search_key,
                        }
                    }
                )

    def list_all_contents_in_folder(self, directory):
        return [os.path.join(directory, f) for f in os.listdir(directory)]

    def processQueueData(self, data):
        try:
            if "report" in data:
                self.file_manager.send_progress_update(data["report"])
            elif "found_file" in data:
                self.file_manager.add_to_found_files(
                    data["found_file"]["target_file"],
                    data["found_file"]["input_string"],
                )
        except Exception as e:
            # print(e)
            pass
