use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use tauri::{AppHandle, Emitter};

pub async fn execute_python_script(
    app: AppHandle,
    keys: String,
    columns: String,
    paths: String,
) -> String {
    // Start python process in the background and pipe its output here
    let mut py = Command::new("python")
    .args(["C:\\Users\\rtiamiyu\\OneDrive - Ovintiv\\Documents\\GG\\seismic_finder\\G&G Network Deletion Tool.py", "search", "-k", keys.as_str(), "-c", columns.as_str(), "-p", paths.as_str()])
    .stdout(Stdio::piped())
    .spawn().unwrap();

    let stdout = py.stdout.as_mut().expect("Failed to capture stdout");

    let reader = BufReader::new(stdout);
    let output = String::new();

    for line in reader.lines() {
        let line = line.expect("Failed to read line");
        if line.contains("done") {
            break;
        }
        let message_arr: Vec<&str> = line.split("::message").collect();
        let message = message_arr.first().unwrap().to_string();

        match message.as_str() {
            "search_result" => app.emit("search_result", line).unwrap(),
            "count_update" => app.emit("count_update", line).unwrap(),
            "progress_update" => app.emit("progress_update", line).unwrap(),
            _ => app.emit("python-output", line).unwrap(),
        };
    }

    let _ = py.wait().expect("py is not running");

    format!("{}", output)
}
