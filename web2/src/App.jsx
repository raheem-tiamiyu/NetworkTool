import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { eel } from "./eel_setup.js";
import Logo from "./components/Logo.jsx";
import SearchForm from "./components/SearchForm.jsx";
import { useEffect, useState } from "react";
import { Alert } from "@mui/material";

// Point Eel web socket to the instance
try {
  // eel.set_host("ws://localhost:3000");
} catch (e) {}

function App() {
  const [checkingForUpdate, setCheckingForUpdate] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpToDate, setIsUpToDate] = useState(null);

  const updateFound = (response) => {
    setCheckingForUpdate(false);
    if (response) {
      setHasUpdate(true);
      setTimeout(() => window.close(), 3000);
      return;
    } else {
      setIsUpToDate(true);
      setTimeout(() => setIsUpToDate(false), 3000);
    }
  };
  window.eel.expose(updateFound, "updateFound");

  useEffect(() => {
    eel.check_for_version_update()(updateFound);
  }, []);

  return (
    <>
      {checkingForUpdate && (
        <Alert severity="info">Checking For Update...</Alert>
      )}
      {hasUpdate && (
        <Alert severity="success">Update found. Restarting Application</Alert>
      )}
      {isUpToDate && (
        <Alert _="on load wait 3s delete me" severity="info">
          Application is up to date
        </Alert>
      )}
      <div className="p-8 lg:px-[120px] min-h-[100vh] w-full">
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          rtl={false}
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
        <Logo />
        <SearchForm />
      </div>
    </>
  );
}

export default App;
