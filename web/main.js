eel.check_for_version_update()(show_update_banner);
function show_update_banner(version) {
  if (!version) {
    return;
  }
  document.getElementById("deleted-sticky-banner-container").innerHTML = `
  <div id="sticky-banner"  tabindex="-1" class="fixed top-0 start-0 z-50 flex justify-between w-full p-4 border-b border-green-500 bg-green-200">
                <div class="flex items-center mx-auto">
                    <p class="flex items-center text-sm font-normal">
                        <span>New version (${version}) was detected and has been download. Launch the new app to use latest version</span>
                    </p>
                </div>
                <div class="flex items-center ">
                    
                </div>
            </div>
            `;

  function deleteBanner() {
    const banner = document.getElementById("sticky-banner");
    if (banner) {
      banner.remove();
    }
  }
}

class Timer {
  constructor() {
    this.start = Date.now();
    this.stop = false;
  }
  displayTimer() {
    // update timer every second
    setInterval(() => {
      if (!this.stop) {
        const timeElapsed = Date.now() - this.start;
        const sec = Math.floor(timeElapsed / 1000);
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        document.getElementById(
          "time"
        ).innerHTML = `${minutes} minute(s):${seconds} seconds`;
      }
    }, 1000);
  }

  startTimer() {
    this.start = Date.now();
    this.stop = false;
  }
  stopTimer() {
    this.stop = true;
  }
}

const timer = new Timer();

function processUploadedFile(
  buffer,
  target_columns,
  target_folders,
  filesPerPage
) {
  let bytes = new Uint8Array(buffer);
  let binaryString = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  let base64String = btoa(binaryString);
  eel.search(
    base64String,
    target_columns,
    target_folders,
    filesPerPage
  )(displayFiles);
}

function findFiles() {
  var searchCompletion = document.getElementById("search-completed");
  if (searchCompletion) searchCompletion.innerHTML = "";
  var foundFilesDiv = document.getElementById("found-files-table-body");
  if (foundFilesDiv) foundFilesDiv.innerHTML = "";
  var searchKeyDisplay = document.getElementById("search_key");
  if (searchKeyDisplay) searchKeyDisplay.innerHTML = "";

  let target_file = document.getElementById("target-file").value.trim();
  let target_file_upload =
    document.getElementById("target-file-upload").files[0];

  let target_columns = document.getElementById("target-columns").value.trim();
  let target_folders = document.getElementById("target-folders").value.trim();
  let filesPerPage = document.getElementById("files-per-page").value;
  console.log(target_file, target_columns, target_folders, target_file_upload);
  timer.startTimer();
  timer.displayTimer();
  document.getElementById("file-count").innerHTML = "";

  if (target_file_upload) {
    let reader = new FileReader();
    reader.onload = function (e) {
      processUploadedFile(
        e.target.result,
        target_columns,
        target_folders,
        filesPerPage
      );
    };
    reader.readAsArrayBuffer(target_file_upload);
  } else {
    console.log(target_file, target_columns, target_folders, filesPerPage);
    eel.search(
      target_file,
      target_columns,
      target_folders,
      filesPerPage
    )(displayFiles);
  }

  document.getElementById("loading").style.display = "flex";
}

function displayFiles(response) {
  timer.stopTimer();
  const data = JSON.parse(response);
  document.getElementById("loading").style.display = "none";
  if (data.error) {
    var resultContainer = document.getElementById("error-container");
    var foundFilesDiv = document.getElementById("found-files-table-body");
    var searchCompletion = document.getElementById("search-completed");
    searchCompletion.innerHTML =
      "<p class='mb-1 font-normal text-red-700'>Search returned with an error</p>";
    foundFilesDiv.innerHTML = "";
    if (data.error == "No file was found") {
      searchCompletion.innerHTML =
        "<p class='mb-1 font-normal text-green-700'>Search Completed -- No file found</p>";
    }
    resultContainer.innerHTML = `<div><p class="text-red-500 text-lg">${data.error}</p></div>`;
    return;
  }
  var searchCompletion = document.getElementById("search-completed");
  searchCompletion.innerHTML =
    "<p class='mb-1 font-normal text-green-700'>Search Completed</p>";

  var foundFilesDiv = document.getElementById("found-files-table-body");
  foundFilesDiv.innerHTML = "";
  document.getElementById("error-container").innerHTML = "";
  document.getElementById("search_key").innerHTML = "";
  document.getElementById("show-more").innerHTML = "";
  const page = data.page;
  const total_page = data.total_page;
  const files = data.files;
  const files_length = data.files_length;
  const search_key = data.search_key;
  const has_more = data.has_more;

  const filenames = files.map((filepath, index) => {
    return `file-${filepath.split("\\").pop()}-${index}`;
  });

  document.getElementById("search_key").innerHTML = `
  <h6 class="text-md flex gap-6">
  <span class="text-gray-900">Page${page + 1}/${total_page} </span>
  </h6>
  <h6 class="font-bold text-md">${files_length} files found for ${search_key.toUpperCase()}</h6>
  <button class="block focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 transition-all" onclick='handleDeleteAll("${filenames}", "${search_key}");' >Delete all</button>
  `;

  files.map((file, index) => {
    foundFilesDiv.innerHTML += fileTemplate(file, search_key, index);
  });

  if (has_more) {
    document.getElementById(
      "show-more"
    ).innerHTML = `<button class="my-5 py-2.5 px-5 rounded-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium" onclick='handleShowMore("${page}");'>Show more</button>`;
  }

  let nextPage = document.getElementById("next-button-top");
  nextPage.style.display = "flex";
  nextPage = document.getElementById("next-button-bottom");
  nextPage.style.display = "flex";
}

function fileTemplate(filepath, search_key, index) {
  const filename = `file-${filepath.split("\\").pop()}-${index}`;

  return `<tr name="${filename}" data-filepath="${filepath}" class="border-b hover:bg-gray-100 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 transition-all">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    ${filename.split("-")[1]}
                </th>
                <td class="px-6 py-4 text-gray-700">
                    ${filepath}
                </td>
                <td class="px-6 py-4">
                    <div class="flex justify-center items-end">
                        <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-sm border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 transition-all" onclick="handleKeepFile('${filename}', '${search_key}')">Keep</button>
                        <button class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 transition-all" onclick="handleDeleteFile('${filename}', '${search_key}'); ">Delete</button>
                    </div>
                </td>
            </tr>`;
}

function handleShowMore(page) {
  let filesPerPage = document.getElementById("files-per-page").value;
  eel.show_more_files(page, filesPerPage)(displayFiles);
}

function handleNextPage() {
  let filesPerPage = document.getElementById("files-per-page").value;
  eel.get_next_page(filesPerPage)(displayFiles);
}
function handleBackPage() {
  let filesPerPage = document.getElementById("files-per-page").value;
  eel.get_previous_page(filesPerPage)(displayFiles);
}

function handleDeleteAll(_filenames, search_key) {
  var userConfirmed = confirm(
    `Are you sure you want to delete all files for ${search_key}?`
  );
  if (userConfirmed) {
    const filenames = _filenames.split(",");
    console.log(filenames);
    filenames.map((file) => {
      handleDeleteFile(file, search_key, true);
    });
    show_deleted_banner(`all ${search_key} files`);
  }
}

function handleDeleteFile(filename, search_key, bulk = false) {
  const target = document.getElementsByName(`${filename}`);
  console.log(target);

  if (target.length) {
    const filepath = target[0].getAttribute("data-filepath");
    target[0].remove();
    if (!bulk) {
      show_deleted_banner(filepath);
    }
    eel.delete_file(filepath, search_key);
  }
}

function handleKeepFile(filename, search_key) {
  const target = document.getElementsByName(`${filename}`);
  const filepath = target[0].getAttribute("data-filepath");
  target[0].remove();
  eel.keep_file(filepath, search_key);
}

function show_deleted_banner(filepath) {
  document.getElementById("deleted-sticky-banner-container").innerHTML = `
  <div id="sticky-banner"  tabindex="-1" class="fixed top-0 start-0 z-50 flex justify-between w-full p-4 border-b border-red-500 bg-red-200">
                <div class="flex items-center mx-auto">
                    <p class="flex items-center text-sm font-normal">
                        <span>Deleted ${filepath}</span>
                    </p>
                </div>
                <div class="flex items-center ">
                    <button data-dismiss-target="#sticky-banner" type="button" class="flex-shrink-0 inline-flex justify-center w-7 h-7 items-center  hover:bg-red-400 hover:text-gray-900 rounded-sm text-sm p-1.5 transition-all" onclick='deleteBanner()' >
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close banner</span>
                    </button>
                </div>
            </div>
            `;

  function deleteBanner() {
    const banner = document.getElementById("sticky-banner");
    if (banner) {
      banner.remove();
    }
  }
  setTimeout(() => {
    deleteBanner();
  }, 3000);
}

eel.expose(updateCount);
function updateCount(i) {
  const countDiv = document.getElementById("file-count");
  countDiv.innerHTML = `${i} File(s) found`;
}

eel.expose(progressUpdate);
function progressUpdate(directory, file) {
  document.getElementById(
    "directory-folder-searched"
  ).innerHTML = `${directory}`;
  document.getElementById("file-folder-searched").innerHTML = `${file}`;
}

// window.onload = () => {
//   eel.check_for_version_update();
// };
