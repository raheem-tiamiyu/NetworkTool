/* eslint-disable react/prop-types */
import React from "react";
import { open } from "@tauri-apps/plugin-dialog";

const FileUpload = ({ label, name, filePath, setFilePath }) => {
  const processUploadedFile = (buffer) => {
    let bytes = new Uint8Array(buffer);
    let binaryString = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    let base64String = btoa(binaryString);
    setFilePath(base64String);
  };

  const handleChange = async (e) => {
    const file = await open({
      multiple: false,
      directory: false,
    });
    setFilePath(file);
  };

  return (
    <div className="mt-2">
      <label
        className="block text-sm font-semibold text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="flex flex-row items-baseline gap-2 flex-1 p-2 w-full border border-gray-300 rounded-sm cursor-pointer bg-gray-50 focus:outline-none text-slate-500">
        <button
          className="mr-4 py-1 px-2
                    rounded-sm border-0
                    text-sm font-semibold
                    shadow
                    bg-violet-50 text-violet-700
                    hover:bg-violet-100"
          onClick={handleChange}
        >
          Choose File
        </button>
        {filePath ? <p>{filePath}</p> : <></>}
      </div>
    </div>
  );
};

export default FileUpload;
