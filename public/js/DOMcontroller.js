const uploadFileDialog = document.querySelector(".upload-file-dialog");
const createFolderDialog = document.querySelector(".create-folder-dialog");
const renameFolderDialog = document.querySelector('.rename-folder-dialog')

const uploadFileForm = document.querySelector(".upload-file-dialog > form");
const createFolderForm = document.querySelector(".create-folder-dialog > form");
const renameFolderForm = document.querySelector(".rename-folder-dialog > form");

const uploadFileButton = document.querySelector(".upload-file-button");
const createFolderButton = document.querySelector(".create-folder-button");

const uploadFileCloseButton = document.querySelector(".upload-file-dialog .close-button")
const createFolderCloseButton = document.querySelector(".create-folder-dialog .close-button")
const renameFolderCloseButton = document.querySelector(".rename-folder-dialog .close-button")

uploadFileButton.addEventListener('click', e => {
  uploadFileDialog.showModal();
})

createFolderButton.addEventListener('click', e => {
  createFolderDialog.showModal();
})

uploadFileCloseButton.addEventListener('click', e => {
  uploadFileDialog.close();
})

createFolderCloseButton.addEventListener('click', e => {
  createFolderDialog.close();
})

renameFolderCloseButton.addEventListener('click', e => {
  renameFolderDialog.close();
})

renameFolderDialog.addEventListener('submit', async e => {
  e.preventDefault()

  const formData = new FormData(e.target);
  const body = Object.fromEntries(formData.entries());

  const url = `/drive/${currentType}/${currentId}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Unable to rename file!")
    return;
  } 

  window.location.reload();
})

const fileDropdownButtons = document.querySelectorAll(".file-dropdown-button")
const dropdown = document.querySelector('.dropdown');
const downloadButton = document.querySelector('.download-button');
const deleteButton = document.querySelector('.delete-button');
const renameButton = document.querySelector('.rename-button');


let currentId = null;
let currentType = null;
let currentName = null;

fileDropdownButtons.forEach(button => {
  button.addEventListener("click", e => {
    e.stopPropagation();

    const row = e.target.closest("tr");
    currentId = row.dataset.id;
    currentType = row.dataset.type;
    currentName = row.dataset.name;

    const x = e.clientX;
    const y = e.clientY;

    dropdown.style.top = `${y}px`;
    dropdown.style.left = `${x}px`;

    if (currentType === "folder") {
      downloadButton.classList.add('hidden');
    } else {
      downloadButton.classList.remove('hidden');
    }

    dropdown.classList.remove('hidden');
  })
})

downloadButton.addEventListener("click", async e => {
  e.stopPropagation();

  if (currentType === "folder") return;

  const url = `/drive/${currentType}/${currentId}`;

  const a = document.createElement("a");
  a.href = url;
  document.body.appendChild(a);
  a.click();
  a.remove();
})

const renameInput = document.querySelector(".rename-input")

renameButton.addEventListener("click", async e => {
  e.stopPropagation();

  renameInput.value = currentName;

  renameFolderDialog.showModal();
})

deleteButton.addEventListener("click", async e => {
  e.stopPropagation();

  const url = `/drive/${currentType}/${currentId}`;

  const res = await fetch(url, {
    method: 'DELETE'
  })

  if (!res.ok) {
    console.error("Unable to delete file")
    return;
  } 
  window.location.reload();
})

document.addEventListener('click', e => {
  dropdown.classList.add('hidden');
});

const input = document.querySelector('input[type="file"]');
const fileName = document.querySelector('.file');

input.addEventListener('change', () => {
  const filenames = Array.from(input.files).map(file => file.name).join(', ');
  fileName.textContent = input.files.length ? filenames : "No file selected";
});