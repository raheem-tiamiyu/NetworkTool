use tauri::{AppHandle, Emitter};
mod python_comms;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn python_search_exe(app: AppHandle, keys: String, columns: String, paths: String) {
    let _res = python_comms::execute_python_script(app, keys, columns, paths).await;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, python_search_exe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
