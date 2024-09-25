import json


class ErrorHandler:
    def __init__(self) -> None:
        pass

    def show_error_message(self, message):
        return json.dumps({"error": message})
