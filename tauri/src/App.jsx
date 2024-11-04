import { ToastContainer } from "react-toastify";
import { check } from "@tauri-apps/plugin-updater";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "react-toastify/dist/ReactToastify.css";
import Logo from "./components/Logo.jsx";
import SearchForm from "./components/SearchForm.jsx";

function App() {
  // Listen for the "python-output" event
  listen("python-output", (event) => {
    // const jsonData = JSON.parse(event.payload);
    console.log("Python Output:", event);
    // You can update the UI with the received JSON data here
  });

  async function checkForAppUpdates(onUserClick) {
    const update = await check();
    if (update === null) {
      await message("Failed to check for updates.\nPlease try again later.", {
        title: "Error",
        kind: "error",
        okLabel: "OK",
      });
      return;
    } else if (update?.available) {
      const yes = await ask(
        `Update to ${update.version} is available!\n\nRelease notes: ${update.body}`,
        {
          title: "Update Available",
          kind: "info",
          okLabel: "Update",
          cancelLabel: "Cancel",
        }
      );
      if (yes) {
        await update.downloadAndInstall();
        // Restart the app after the update is installed by calling the Tauri command that handles restart for your app
        // It is good practice to shut down any background processes gracefully before restarting
        // As an alternative, you could ask the user to restart the app manually
        await invoke("graceful_restart");
      }
    } else if (onUserClick) {
      await message("You are on the latest version. Stay awesome!", {
        title: "No Update Available",
        kind: "info",
        okLabel: "OK",
      });
    }
  }

  return (
    <main className="container">
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
    </main>
  );
}

export default App;
