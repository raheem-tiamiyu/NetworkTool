import os
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import duckdb
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class NetworkWatcher(FileSystemEventHandler):
    def __init__(self, root_dir, pq_file=None) -> None:
        self.root_dir = root_dir
        self.pq_file = pq_file
        self.con = duckdb.connect()
        # self.create_parquet_from_files()

    # update with the function in fast_search.py
    def create_parquet_from_files(self):
        data = []
        for root, dirs, files in os.walk(self.root_dir):
            for file in files:
                file_path = os.path.join(root, file)
                data.append((file.lower(), file_path))
        df = pd.DataFrame(data, columns=["file_name", "file_path"])
        table = pa.Table.from_pandas(df)
        pq.write_table(table, self.pq_file)

    def on_any_event(self, event):
        if event.is_directory:
            return
        print(event)

    def update_pq_filesystem(self, event, pq_file):
        match event.event_type:
            case "moved":
                # get src and destination path
                src_path = os.path.dirname(event.src_path)
                dest_path = os.path.dirname(event.dest_path)
                # get filename
                filename = os.path.basename(dest_path)
                # query for file name and src file path
                query = "UPDATE parquet_scan(%s) SET file_name = %s, file_path = %s WHERE file_name = %s AND file_path = %s"

                result = self.con.execute(
                    query, (pq_file, filename, src_path, filename, dest_path)
                )
                # Write the updated table back to a Parquet file
                self.con.execute(
                    "COPY %s TO 'updated_example.parquet' (FORMAT 'parquet')"
                )

                pass

            case "created":
                # Insert path and file name
                pass
            case "deleted":
                # remove file and path from pq
                pass


def start_monitoring(root_dir, parquet_file):
    event_handler = NetworkWatcher(root_dir)
    observer = Observer()
    observer.schedule(event_handler, path=root_dir, recursive=True)
    observer.start()
    try:
        while True:
            pass
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


root_directory = r"C:\Users\rtiamiyu\OneDrive - Ovintiv\Documents\GG\tests"
parquet_file = "file_index.parquet"
start_monitoring(root_directory, parquet_file)
