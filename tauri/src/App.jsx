import { ToastContainer } from "react-toastify";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
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

  async function checkUpdate(params) {
    const update = await check({
      target: "windows-x86_64",
    });
    console.log(update);
    if (update) {
      console.log(
        `found update ${update.version} from ${update.date} with notes ${update.body}`
      );
      let downloaded = 0;
      let contentLength = 0;
      // alternatively we could also call update.download() and update.install() separately
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength;
            console.log(
              `started downloading ${event.data.contentLength} bytes`
            );
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            console.log(`downloaded ${downloaded} from ${contentLength}`);
            break;
          case "Finished":
            console.log("download finished");
            break;
        }
      });

      console.log("update installed");
      await relaunch();
    }
  }
  checkUpdate();

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
