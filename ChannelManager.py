from time import sleep
import eel
import json
from ErrorHandler import *
from FileManager import *


class ChannelManager:
    global file_manager
    file_manager = FileManager()

    def __init__(self) -> None:
        self.error_handler = ErrorHandler()

    def send_count_update(self, file_count):
        print("count_update::message", json.dumps({"count": file_count}))
        sleep(5)
        # eel.updateCount(file_count)

    def progress_update(self, update):
        try:
            print("progress_update::message", json.dumps(update))
            return update
        except Exception as e:
            print(e)
            pass

    def search(self, search_keys, specified_columns, target_folders):
        result = file_manager.search(search_keys, specified_columns, target_folders)
        print("search_result::message", json.dumps(result))
        return result

    @eel.expose
    def delete_file(file_path, search_key):
        return file_manager.delete_file(file_path, search_key)

    @eel.expose
    def keep_file(file_path, search_key):
        return file_manager.keep_file(file_path, search_key)

    @eel.expose
    def show_more_files(page, files_per_page):
        return file_manager.show_more_files(page, files_per_page)

    @eel.expose
    def get_next_page(files_per_page):
        return file_manager.get_next_page(files_per_page)

    @eel.expose
    def get_previous_page(files_per_page):
        return file_manager.get_previous_page(files_per_page)
