function proccessUploadedFile(buffer, target_columns, target_folders) {
  let bytes = new Uint8Array(buffer);
  let binaryString = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  let base64String = btoa(binaryString);
  eel.search(base64String, target_columns, target_folders)(displayFiles);
}

function findFiles() {
  let target_file = document.getElementById("target-file").value.trim();
  let target_file_upload =
    document.getElementById("target-file-upload").files[0];

  let target_columns = document.getElementById("target-columns").value.trim();
  let target_folders = document.getElementById("target-folders").value.trim();
  if (target_file_upload) {
    let reader = new FileReader();
    reader.onload = function (e) {
      proccessUploadedFile(e.target.result, target_columns, target_folders);
    };
    reader.readAsArrayBuffer(target_file_upload);
  } else {
    eel.search(target_file, target_columns, target_folders)(displayFiles);
  }

  document.getElementById("loading").style.display = "flex";
}

function displayFiles(response) {
  const data = JSON.parse(response);
  document.getElementById("loading").style.display = "none";
  if (data.error) {
    document.getElementById("loading").innerHTML("An error has occured");
    var resultContainer = document.getElementById("error-container");
    var foundFilesDiv = document.getElementById("found-files-table-body");
    foundFilesDiv.innerHTML = "";
    resultContainer.innerHTML = `<div><p class="text-red-600 text-lg font-bold  dark:text-white">${data.error}</p></div>`;
    return;
  }

  var foundFilesDiv = document.getElementById("found-files-table-body");
  foundFilesDiv.innerHTML = "";
  document.getElementById("error-container").innerHTML = "";
  document.getElementById("search_key").innerHTML = "";
  document.getElementById("show-more").innerHTML = "";
  const page = data.page;
  const total_page = data.total_page;
  const files = data.files;
  const search_key = data.search_key;
  const has_more = data.has_more;

  const filenames = files.map((filepath, index) => {
    return `file-${filepath.split("\\").pop()}-${index}`;
  });

  document.getElementById(
    "search_key"
  ).innerHTML = `<h6 class="font-bold text-md flex gap-6"><span class="text-gray-600">Page${
    page + 1
  }/${total_page} </span>${search_key.toUpperCase()}</h6><button class="block focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" onclick='handleDeleteAll("${filenames}", "${search_key}");' >Delete all</button>`;

  files.map((file, index) => {
    foundFilesDiv.innerHTML += fileTemplate(file, search_key, index);
  });

  if (has_more) {
    document.getElementById(
      "show-more"
    ).innerHTML = `<button class="my-5 py-2.5 px-5 rounded-lg text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg" onclick='handleShowMore("${page}");'>Show more</button>`;
  }

  const nexpPage = document.getElementById("next-button");
  nexpPage.style.display = "flex";
}

function fileTemplate(filepath, search_key, index) {
  const filename = `file-${filepath.split("\\").pop()}-${index}`;

  return `<tr name="${filename}" data-filepath="${filepath}" class="border-b hover:bg-gray-100 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    ${filename.split("-")[1]}
                </th>
                <td class="px-6 py-4 text-gray-700">
                    ${filepath}
                </td>
                <td class="px-6 py-4">
                    <div class="flex justify-center items-end">
                        <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100" onclick="handleKeepFile('${filename}', '${search_key}')">Keep</button>
                        <button class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" onclick="handleDeleteFile('${filename}', '${search_key}'); ">Delete</button>
                    </div>
                </td>
            </tr>`;
}

function handleShowMore(page) {
  eel.handleMorePage(page)(displayFiles);
}

function handleNextPage() {
  eel.handleNextPage()(displayFiles);
}
function handleBackPage() {
  eel.handleBackPage()(displayFiles);
}

function handleDeleteAll(_filenames, search_key) {
  const filenames = _filenames.split(",");
  console.log(filenames);
  filenames.map((file) => {
    handleDeleteFile(file, search_key);
  });
}

function handleDeleteFile(filename, search_key) {
  const target = document.getElementsByName(`${filename}`);
  console.log(target);
  const filepath = target[0].getAttribute("data-filepath");
  target[0].remove();
  eel.delete_file(filepath, search_key);
}

function handleKeepFile(filename, search_key) {
  const target = document.getElementsByName(`${filename}`);
  const filepath = target[0].getAttribute("data-filepath");
  target[0].remove();
  eel.keep_file(filepath, search_key);
}

eel.expose(updateCount);
function updateCount(i) {
  const countDiv = document.getElementById("file-count");
  countDiv.innerHTML = `${i} File(s) found`;
}

// window.onload = () => {
//   eel.check_for_version_update();
// };
