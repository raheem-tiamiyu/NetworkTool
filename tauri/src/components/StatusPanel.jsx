/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { LinearProgress } from "@mui/material";

const StatusPanel = ({
  setTableContent,
  setIsSearching,
  setError,
  isSearching,
}) => {
  window.eel.expose(updateCount, "updateCount");
  function updateCount(i) {
    const countDiv = document.getElementById("file-count");
    countDiv.innerHTML = `${i}`;
  }
  window.eel.expose(progressUpdate, "progressUpdate");
  function progressUpdate(directory, file) {
    // document.getElementById(
    //   "directory-folder-searched"
    // ).innerHTML = `${directory}`;
    document.getElementById("file-folder-searched").innerHTML = `${file}`;
  }

  const resetSearch = () => {
    setTableContent(null);
    setError(null);
    setIsSearching(false);
  };

  return (
    <div className="w-full py-4 my-4">
      <hr className="w-full h-1 mx-auto bg-gray-100 border-0 rounded my-4" />
      {isSearching && (
        <>
          <p className="text-sm">Searching...</p>
          <LinearProgress />
        </>
      )}

      <div className="">
        <p className="mt-4 font-normal text-gray-900">
          Files Found:{" "}
          <span id="file-count" className="">
            0
          </span>
        </p>

        <p className="mt-4 font-normal text-gray-900">
          File:{" "}
          <span
            id="file-folder-searched"
            className="font-normal text-gray-900"
          ></span>
        </p>
        {/* <p className="mt-4 font-normal text-gray-900">
          Directory:{" "}
          <span
            id="directory-folder-searched"
            className="font-normal text-gray-900"
          ></span>
        </p> */}
      </div>
      <button
        className="mt-4 shadow text-white bg-blue-600 hover:bg-blue-800 rounded-sm w-48 h-8 sm:w-auto px-4 py-1 text-center  transition duration-200 ease-in"
        onClick={resetSearch}
      >
        New Search
      </button>

      <div id="search-completed"></div>
      <hr className="w-full h-1 mx-auto bg-gray-100 border-0 rounded my-4" />
    </div>
  );
};

export default StatusPanel;
