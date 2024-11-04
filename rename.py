import os
import time


def is_file_in_use(filepath):
    is_in_use = True
    try:
        with open(filepath, "r+"):
            pass
    except IOError as e:
        print(e)
        return is_in_use
    is_in_use = False
    return is_in_use


def rename(filepath, new_name):
    try:

        os.rename(filepath, new_name)
        print("done")
        return True
    except Exception as e:
        print(e)
    print("failed")
    return False


# print(rename("mapped_enshare.parquet", "mapped_enshare_4.parquet"))
is_name_Changed = False
while not is_name_Changed:
    is_name_Changed = rename("mapped_enshare.parquet", "mapped_enshare_19.parquet")
    time.sleep(1)
