import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { RadioGroup } from "@mui/material";

import InputFields from "./InputFields.jsx";
import ResultsTable from "./ResultsTable.jsx";
import Spinner from "./Spinner.jsx";
import RadioButton from "./RadioButton.jsx";
import Error from "./Error.jsx";
import InputStepper from "./InputStepper.jsx";
import FileUpload from "./FileUpload.jsx";
import StatusPanel from "./StatusPanel.jsx";

const SearchForm = () => {
  const [filePath, setFilePath] = useState("");
  const [upload, setUpload] = useState(null);
  const [tokens, setTokens] = useState("");
  const [targetColumns, setTargetColumns] = useState("");

  const [networkPath, setNetworkPath] = useState(
    "C:\\Users\\rtiamiyu\\OneDrive - Ovintiv\\Documents\\GG\\tests"
  );
  const [isSearching, setIsSearching] = useState(false);
  const [filesPerPage, setFilesPerPage] = useState(100);
  const [tableContent, setTableContent] = useState();
  const [tokenInputType, setTokenInputType] = useState("upload");

  const [error, setError] = useState();

  const validateInput = () => {
    if (networkPath.length <= 0) {
      toast.error("Enter Network/Folder Path");
      return false;
    }
    if (filesPerPage <= 0) {
      toast.error("Invalid Files Per Page");
      return false;
    }
    if (tokenInputType === "tokens") {
      if (tokens.length <= 0) {
        toast.error("Enter Search Tokens");
        return false;
      }
    } else if (tokenInputType === "upload") {
      if (targetColumns.length <= 0) {
        toast.error("Enter Column Name");
        return false;
      }
      if (!upload) {
        toast.error("Upload a file");
        return false;
      }
    }
    return true;
  };

  // Listen for the "progress_update" event
  listen("search_result", (event) => {
    const payload = event.payload.split("::message")[1];
    // const jsonData = JSON.parse(payload);
    // console.log("search_result:", JSON.parse(payload));
    processSearchResults(payload);
    //  update the UI with the received JSON data here
    // updateCount(jsonData["count"]);
  });
  const findFiles = async () => {
    if (!validateInput()) {
      return;
    }
    const tokenInput = {
      tokens: tokens,
      upload: upload,
      path: filePath,
    };
    setIsSearching(true);
    setTableContent(null);
    setError(null);
    const res = await invoke("python_search_exe", {
      keys: tokens,
      columns: "1",
      paths: networkPath,
    });
    setTimeout(() => {}, 3000);
  };

  const processSearchResults = (response) => {
    setIsSearching(false);

    // update panel
    // clear error & result variables
    if (!response) {
      return;
    }
    const data = JSON.parse(response);
    if (data.error) {
      // handle error
      setError(data);
      return;
    }
    setTableContent(data);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="w-full mt-8 flex flex-col items-center justify-center"
    >
      {!isSearching && !tableContent && !error && (
        <>
          <InputStepper
            steps={[
              {
                label: "Enter search tokens",
                content: (
                  <>
                    <RadioGroup row>
                      <RadioButton
                        checked={tokenInputType}
                        value="tokens"
                        label="Tokens"
                        onChange={setTokenInputType}
                      />
                      <RadioButton
                        checked={tokenInputType}
                        value="upload"
                        label="Upload File"
                        onChange={setTokenInputType}
                      />
                    </RadioGroup>
                    {tokenInputType === "tokens" && (
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <InputFields
                          label="Search Token(s)"
                          name="tokens"
                          tip="Separate multiple tokens with a comma."
                          type="text"
                          value={tokens}
                          placeholder="Enter search tokens..."
                          changeFunction={setTokens}
                        />
                      </motion.div>
                    )}
                    {tokenInputType === "upload" && (
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FileUpload
                          label="Upload File"
                          name="tokens"
                          value={upload}
                          filePath={filePath}
                          setFilePath={setFilePath}
                        />
                        <InputFields
                          label="Column Name(s)"
                          tip="Separate multiple columns with a comma."
                          type="text"
                          value={targetColumns}
                          changeFunction={setTargetColumns}
                        />
                      </motion.div>
                    )}
                  </>
                ),
              },
              {
                label: "Select folder to search",
                content: (
                  <InputFields
                    label="Network/Folder Path(s)"
                    tip="Separate multiple locations with a comma."
                    type="textarea"
                    value={networkPath}
                    placeholder=""
                    changeFunction={setNetworkPath}
                  />
                ),
              },
              {
                label: "Set files per page",
                content: (
                  <InputFields
                    label="Files Per Page"
                    tip={""}
                    type="number"
                    value={filesPerPage}
                    placeholder=""
                    changeFunction={setFilesPerPage}
                  />
                ),
              },
            ]}
            finalButton={
              <button
                type="button"
                className="mt-4 shadow text-white bg-blue-600 hover:bg-blue-800 rounded-sm w-48 h-8 sm:w-auto px-4 py-1 text-center  transition duration-200 ease-in"
                onClick={findFiles}
              >
                Search
              </button>
            }
          />
        </>
      )}
      {(isSearching || tableContent || error) && (
        <StatusPanel
          setTableContent={setTableContent}
          setIsSearching={setIsSearching}
          setError={setError}
          isSearching={isSearching}
        />
      )}

      {error && !isSearching ? <Error data={error} /> : <></>}

      {tableContent && !isSearching && (
        <ResultsTable
          data={tableContent}
          filesPerPage={filesPerPage}
          processNewPage={processSearchResults}
        />
      )}
    </motion.div>
  );
};

export default SearchForm;
