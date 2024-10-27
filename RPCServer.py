import json
import threading
import zmq


class RPCServer:
    def __init__(self) -> None:
        self.context = zmq.Context()
        self.rep_socket = self.context.socket(zmq.REP)
        self.pub_socket = self.context.socket(zmq.PUB)
        self.functions = {}

    def register_functions(self, func):
        self.functions[func.__name__] = func

    def register_class(self, cls):
        for name, method in inspect.getmembers(cls, predicate=inspect.isfunction):
            self.register_functions(method)

    def start(self, address, pub_address):
        self.rep_socket.bind(address)
        self.pub_socket.bind(pub_address)
        while True:
            message = self.rep_socket.recv()
            request = json.loads(message)
            func_name = request["function"]
            args = request.get("args", [])
            kwargs = request.get("kwargs", {})
            threading.Thread(
                target=self.dispathc, args=(func_name, args, kwargs)
            ).start()

    def dispatch(self, func_name, args, kwargs):
        if func_name in self.functions:
            try:
                result = self.functions[func_name]
                self.rep_socket.send_string(json.dumps({"status": "success"}))
            except Exception as e:
                self.rep_socket.send_string(
                    json.dumps({"status": "error", "error": str(e)})
                )
        else:
            pass
