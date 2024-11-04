import json


class ErrorHandler:
    def __init__(self) -> None:
        pass

    def show_error_message(self, message):
        error = json.dumps({"error": message})
        print(error)
        return error
