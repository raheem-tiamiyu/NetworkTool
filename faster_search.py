# %%
import concurrent.futures
import os
from time import perf_counter
from numpy import append
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import duckdb

start = perf_counter()


# %%
def scan_directory(root, files):
    """Map files to the directory they belong in"""
    print(f"Adding {root} {perf_counter() - start}", end="\r")
    data = []
    for file in files:
        file_path = os.path.join(root, file)
        data.append((file.lower(), file_path))
    return data


# %%
def add_data_to_pq(data, parquet_file):
    """Append the specified data to the specified parquet file"""
    df = pd.DataFrame(data, columns=["file_name", "file_path"])
    table = pa.Table.from_pandas(df)
    if os.path.exists(parquet_file):
        existing_table = pq.read_table(parquet_file)
        table = pa.concat_tables([existing_table, table])
    pq.write_table(table, parquet_file)


# %%
def create_parquet_of_file_system(root_dir, parquet_file, batch_size=1000):
    """Create a parquet file of the file system"""
    data = []

    print("Creating ")

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []

        for root, _, files in os.walk(os.path.normpath(root_dir)):
            futures.append(executor.submit(scan_directory, root, files))

        for future in concurrent.futures.as_completed(futures):

            data.extend(future.result())
            if len(data) >= batch_size:
                add_data_to_pq(data, parquet_file)
                data = []
        if data:
            add_data_to_pq(data, parquet_file)
            data = []


# %%
def search_file_with_duckdb(parquet_file, query):
    con = duckdb.connect()
    query = query.lower()
    result = con.execute(
        f"""
        SELECT file_name, file_path FROM parquet_scan('{parquet_file}')
        WHERE file_name LIKE '%{query}%'
    """
    ).fetchall()
    con.close()
    return result


# %%
def convert_pq_to_csv(pq_file, csv_file):
    df = pd.read_parquet(pq_file)
    df.to_csv(csv_file, index=False)


# %%
# root_dir = r"C:/"
root_dir = r"//encana.com/ecnshare/CGY"
parquet_file = "mapped_CGY.parquet"
csv_file = "mapped_CGY.csv"

create_parquet_of_file_system(root_dir, parquet_file)
# convert_pq_to_csv(parquet_file, csv_file)

# res = search_file_with_duckdb(parquet_file, "test2")
print(f"Finished {perf_counter() - start}")


# %%
# res = search_file_with_duckdb(parquet_file, "test2")
# print(res)
