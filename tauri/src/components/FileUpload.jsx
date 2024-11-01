/* eslint-disable react/prop-types */
import React from "react";

const FileUpload = ({ label, name, changeFunction }) => {
  const processUploadedFile = (buffer) => {
    let bytes = new Uint8Array(buffer);
    let binaryString = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    let base64String = btoa(binaryString);
    changeFunction(base64String);
  };

  const handleChange = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    reader.onload = function (e) {
      processUploadedFile(e.target.result);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  return (
    <div className="mt-2">
      <label
        className="block text-sm font-semibold text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="items-center p-2 w-full border border-gray-300 rounded-sm cursor-pointer bg-gray-50 focus:outline-none block text-slate-500
                    file:mr-4 file:py-1 file:px-2
                    file:rounded-sm file:border-0
                    file:text-sm file:font-semibold
                    file:shadow
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100
                  "
        type="file"
        name={name}
        onChange={handleChange}
      />
    </div>
  );
};

export default FileUpload;
