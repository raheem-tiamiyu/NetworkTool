import json
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
from threading import Thread, Lock
from collections import defaultdict
from ErrorHandler import *
from SearchHandler import *


class FileManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(FileManager, cls).__new__(cls)
        return cls._instance

    def __init__(self) -> None:

        if not hasattr(self, "initialized"):
            self.initialized = True
            self.error_handler = ErrorHandler()
            self.found_files = defaultdict(list)
            self.files = []
            self.misses = defaultdict(list)
            self.search_keys = []
            self.files_searched = 0
            self.directories_searched = 0
            self.currentPage = 0

    def set_comms_channel(self, channel_manager):
        self.comms_channel = channel_manager

    def add_to_found_files(self, file, search_key):
        self.files.append(file)
        self.found_files[search_key].append(file)
        self.comms_channel.send_count_update(len(self.files))

    def send_progress_update(self, update):
        self.comms_channel.progress_update(update["folder"], update["file"])

    def search(self, search_keys, specified_columns, target_folders, files_per_page):
        try:
            self.found_files = defaultdict(list)
            self.files = []
            self.misses = defaultdict(list)
            self.search_keys = []
            self.files_searched = 0
            self.directories_searched = 0
            self.currentPage = 0
            files_per_page = int(files_per_page)
            search_handler = SearchHandler(self)
            search_handler.do_multiprocess_search(
                search_keys, specified_columns, target_folders
            )

            # Send results
            self.search_keys = list(self.found_files.keys())

            if len(self.search_keys) == 0:
                return self.error_handler.show_error_message(
                    message="No file was found"
                )

            return json.dumps(
                {
                    "files": self.found_files[self.search_keys[0]][:files_per_page],
                    "search_key": self.search_keys[0],
                    "number_of_files_found": len(self.files),
                    "files_length": len(self.found_files[self.search_keys[0]]),
                    "page": 0,
                    "total_page": len(self.search_keys),
                    "has_more": len(self.found_files[self.search_keys[0]])
                    > files_per_page,
                }
            )
        except Exception as e:
            return self.error_handler.show_error_message(
                message=f"An error occurred while the file manager was processing search results.{e}"
            )

    def delete_file(self, file_path, search_key):
        try:
            if os.path.exists(file_path):
                index = self.found_files[search_key].index(file_path)
                if index > -1:
                    if len(self.found_files[search_key]) - 1 > index:
                        self.found_files[search_key] = (
                            self.found_files[search_key][:index]
                            + self.found_files[search_key][index + 1 :]
                        )
                    else:
                        self.found_files[search_key] = self.found_files[search_key][
                            :index
                        ]
                os.remove(file_path)
                self.comms_channel.send_count_update(len(self.files))
                return True
        except Exception as e:
            return self.error_handler.show_error_message(
                message=f"An error occurred while the file manager was deleting file path.{e}"
            )

    def keep_file(self, file_path, search_key):
        index = self.found_files[search_key].index(file_path)
        if index > -1:
            if len(self.found_files[search_key]) - 1 > index:
                self.found_files[search_key] = (
                    self.found_files[search_key][:index]
                    + self.found_files[search_key][index + 1 :]
                )
            else:
                self.found_files[search_key] = self.found_files[search_key][:index]
        self.comms_channel.send_count_update(len(self.files))

    def show_more_files(self, page, files_per_page):
        files_per_page = int(files_per_page)
        try:
            page = int(page)
            files_per_page = min(
                files_per_page, len(self.found_files[self.search_keys[page]])
            )
            return json.dumps(
                {
                    "files": self.found_files[self.search_keys[page]][:files_per_page],
                    "search_key": self.search_keys[page],
                    "number_of_files_found": len(self.files),
                    "page": page,
                    "total_page": len(self.search_keys),
                    "files_length": len(self.found_files[self.search_keys[page]]),
                    "has_more": len(self.found_files[self.search_keys[page]])
                    > files_per_page,
                }
            )
        except Exception as e:
            return self.error_handler.show_error_message(
                message=f"The file manager couldn't get the rest of the files\n\n{e}"
            )

    def get_next_page(self, files_per_page):
        files_per_page = int(files_per_page)
        try:
            has_more = False
            nextPage = 1 + self.currentPage
            if nextPage > len(self.search_keys) - 1:
                self.currentPage = len(self.search_keys)
                return self.error_handler.show_error_message(message=f"All Done!")

            if len(self.found_files[self.search_keys[nextPage]]) > files_per_page:
                has_more = True
            self.currentPage = nextPage
            return json.dumps(
                {
                    "files": self.found_files[self.search_keys[nextPage]][
                        :files_per_page
                    ],
                    "search_key": self.search_keys[nextPage],
                    "number_of_files_found": len(self.files),
                    "page": nextPage,
                    "total_page": len(self.search_keys),
                    "files_length": len(self.found_files[self.search_keys[nextPage]]),
                    "has_more": has_more,
                }
            )
        except Exception as e:
            return self.error_handler.show_error_message(
                message=f"Couldn't get the next page\n\n{e}"
            )

    def get_previous_page(self, files_per_page):
        files_per_page = int(files_per_page)
        has_more = False
        nextPage = self.currentPage - 1
        if nextPage <= -1:
            self.currentPage = -1
            return self.error_handler.show_error_message(message=f"No files here")

        self.currentPage = nextPage
        if len(self.found_files[self.search_keys[nextPage]]) > files_per_page:
            has_more = True
        self.currentPage = nextPage
        return json.dumps(
            {
                "files": self.found_files[self.search_keys[nextPage]][:files_per_page],
                "search_key": self.search_keys[nextPage],
                "number_of_files_found": len(self.files),
                "page": nextPage,
                "total_page": len(self.search_keys),
                "files_length": len(self.found_files[self.search_keys[nextPage]]),
                "has_more": has_more,
            }
        )
