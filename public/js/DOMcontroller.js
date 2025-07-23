const uploadFileDialog = document.querySelector(".upload-file-dialog");
const createFolderDialog = document.querySelector(".create-folder-dialog");

const uploadFileForm = document.querySelector(".upload-file-dialog > form");
const createFolderForm = document.querySelector(".create-folder-dialog > form");

const uploadFileButton = document.querySelector(".upload-file-button");
const createFolderButton = document.querySelector(".create-folder-button");

const uploadFileCloseButton = document.querySelector(".upload-file-dialog .close-button")
const createFolderCloseButton = document.querySelector(".create-folder-dialog .close-button")

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

const fileDropdownButtons = document.querySelectorAll(".file-dropdown-button")
const dropdown = document.querySelector('.dropdown');
const downloadButton = document.querySelector('.download-button');
const deleteButton = document.querySelector('.delete-button');

let currentId = null;
let currentType = null;

fileDropdownButtons.forEach(button => {
  button.addEventListener("click", e => {
    e.stopPropagation();

    const row = e.target.closest("tr");
    currentId = row.dataset.id;
    currentType = row.dataset.type;

    const x = e.clientX;
    const y = e.clientY;

    dropdown.style.top = `${y}px`;
    dropdown.style.left = `${x}px`;
    dropdown.classList.remove('hidden');
  })
})

downloadButton.addEventListener("click", async e => {
  e.stopPropagation();

  const url = `/drive/${currentType}/${currentId}`;

  const a = document.createElement("a");
  a.href = url;
  document.body.appendChild(a);
  a.click();
  a.remove();
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
