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

fileDropdownButtons.forEach(button => {
  button.addEventListener("click", e => {
    const row = e.target.closest("tr");
    const id = row.dataset.id;

    const dropdownContent = document.createElement('div');
    Object.assign(dropdownContent.style, {
      position: "absolute",
      backgroundColor: "#f1f1f1",
      minWidth: "160px",
      boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
      zIndex: "1"
    });

    const downloadButton = document.createElement('a');
    downloadButton.textContent = "Download";

    downloadButton.href = `/drive/file/${id}`;
    downloadButton.download = ""
    
    // downloadButton.addEventListener('click', async e => {
    //   const res = await fetch(`/drive/file/${id}`, {
    //     method: "POST",
    //   })

    //   if (!res.ok) {
    //     console.error(res.statusText);
    //     return;
    //   }

    //   console.log(file)
    // })

    Object.assign(downloadButton.style, {
      color: "black",
      padding: "12px 16px",
      display: "block",
      cursor: "pointer",
      textDecoration: "none"
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', async e => {
      
    })

    Object.assign(deleteButton.style, {
      color: "black",
      padding: "12px 16px",
      display: "block",
      cursor: "pointer"
    });

    dropdownContent.append(downloadButton, deleteButton)
    button.insertAdjacentElement("afterend", dropdownContent)
  })
})

// uploadFileForm.addEventListener('submit', async e => {
//   e.preventDefault()

//   const formData = new FormData(form);
//   const formUrl = new URL(createFolderForm.action).pathname;
  
//   const res = await fetch(formUrl, {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) {
//     console.error("Something went wrong!", res);
//   } 
// })