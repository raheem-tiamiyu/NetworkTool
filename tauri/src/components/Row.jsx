/* eslint-disable react/prop-types */
import React, { useState } from "react";

const Row = ({ filepath, searchKey, index, deleteSignal }) => {
  const [isVisible, setIsVisible] = useState(true);
  const filename = filepath.split("\\").pop();

  const handleKeepFile = () => {
    eel.keep_file(filepath, searchKey);
    setIsVisible(false);
  };
  const handleDeleteFile = () => {
    eel.delete_file(filepath, searchKey);
    setIsVisible(false);
  };
  return (
    isVisible && (
      <tr
        name={`${filename}-${index}`}
        className="w-full border-b hover:bg-gray-100 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 transition-all"
      >
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap dark:text-white"
        >
          {filename}
        </th>
        <td className="px-6 py-4 text-gray-950">{filepath}</td>
        <td className="px-6 py-4">
          <div className="flex justify-center items-end">
            <button
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-sm border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 transition-all"
              onClick={handleKeepFile}
            >
              Keep
            </button>
            <button
              className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 transition-all"
              onClick={handleDeleteFile}
            >
              Delete
            </button>
          </div>
        </td>
        {deleteSignal && handleDeleteFile()}
      </tr>
    )
  );
};

export default Row;
