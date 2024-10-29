import eel
from ErrorHandler import *
from FileManager import *


class ChannelManager:
    global file_manager
    file_manager = FileManager()

    def __init__(self) -> None:
        self.error_handler = ErrorHandler()

    def test_send(self) -> dict:
        """Test sending on a channel"""
        return {"message": "Hello from py"}

    def test_receive(self, text) -> None:
        """Test receiving on a channel"""
        print("received: ", text)
        return "Hello from py"

    def send_count_update(self, file_count):
        print(file_count)
        eel.updateCount(file_count)

    def progress_update(self, folder, file):
        try:
            print(folder)
            eel.progressUpdate(folder, file)
        except Exception as e:
            print(e)
            pass

    @eel.expose
    def search(search_keys, specified_columns, target_folders, files_per_page):
        return file_manager.search(
            search_keys, specified_columns, target_folders, files_per_page
        )

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
