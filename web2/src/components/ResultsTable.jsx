/* eslint-disable react/prop-types */
import { useState } from "react";
import Row from "./Row";
import { eel } from "../eel_setup.js";

const ResultsTable = ({ data, filesPerPage, processNewPage }) => {
  const page = data?.page;
  const total_page = data?.total_page;
  const files_length = data?.files_length;
  const searchKey = data?.search_key;
  const has_more = data?.has_more;
  const files = data?.files;

  const [deleteAllSignal, setDeleteAllSignal] = useState(false);

  const handleBackPage = () => {
    setDeleteAllSignal(false);
    eel.get_previous_page(filesPerPage)(processNewPage);
  };
  const handleNextPage = () => {
    setDeleteAllSignal(false);
    eel.get_next_page(filesPerPage)(processNewPage);
  };
  const handleShowMore = () => {
    setDeleteAllSignal(false);
    eel.show_more_files(page, filesPerPage)(processNewPage);
  };

  const handleDeleteAll = () => {
    var userConfirmed = confirm(
      `Are you sure you want to delete all files for ${searchKey}?`
    );
    if (userConfirmed) {
      setDeleteAllSignal(true);
    }
  };

  return (
    <div>
      <div id="found-files" className="items-center justify-center mt-4">
        <div
          className="flex justify-between items-center gap-20"
          id="search_key"
        >
          <div
            id="next-button-top"
            className="flex flex-row justify-start items-center gap-2"
          >
            <button
              type="button"
              role="back"
              className="py-2 px-2 text-sm font-medium text-gray-900 focus:outline-none bg-gray-50 rounded-sm border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 disabled:bg-gray-200 disabled:cursor-not-allowed focus:ring-gray-100 transition-all"
              disabled={page <= 0}
              onClick={handleBackPage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
                title="back"
              >
                <path
                  fillRule="evenodd"
                  d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h6 className="text-md">
              <span className="text-gray-900">
                {page + 1} / {total_page}
              </span>
            </h6>
            <button
              type="button"
              role="next"
              className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-sm text-sm py-2 px-2 disabled:bg-gray-300 disabled:cursor-not-allowed mb-2 transition-all"
              disabled={page >= total_page - 1}
              onClick={handleNextPage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
                title="next"
              >
                <path
                  fillRule="evenodd"
                  d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <h6 className="text-md">
            {files_length} file(s) found for {searchKey?.toUpperCase()}
          </h6>
          <button
            className="block focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-sm text-sm px-5 py-2.5  transition-all"
            onClick={handleDeleteAll}
          >
            Delete all
          </button>
        </div>

        <div
          id="result-container"
          className="relative overflow-x-auto shadow-md sm:rounded-sm"
        >
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="w-full text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  File name
                </th>
                <th scope="col" className="px-6 py-3">
                  Path
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody id="found-files-table-body">
              {files.map((filePath, index) => (
                <Row
                  key={filePath}
                  filepath={filePath}
                  searchKey={searchKey}
                  index={index}
                  deleteSignal={deleteAllSignal}
                />
              ))}
            </tbody>
          </table>
          <div id="error-container"></div>
        </div>
        <div className="flex justify-between items-center">
          <div id="show-more">
            {has_more ? (
              <button
                className="my-5 py-2.5 px-5 rounded-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium"
                onClick={handleShowMore}
              >
                Show more
              </button>
            ) : (
              <></>
            )}
          </div>
          <div
            id="next-button-bottom"
            className="flex justify-end items-center gap-5 m-5"
          >
            <button
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-gray-50 rounded-sm border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 disabled:bg-gray-200 disabled:cursor-not-allowed focus:ring-gray-100 transition-all"
              disabled={page <= 0}
              onClick={handleBackPage}
            >
              Back
            </button>

            <button
              className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-sm text-sm px-5 py-2.5 disabled:bg-gray-300 disabled:cursor-not-allowed me-2 mb-2 transition-all"
              disabled={page >= total_page - 1}
              onClick={handleNextPage}
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
