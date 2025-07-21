const { Router } = require("express")
const multer  = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { format, isToday, nextDay } = require('date-fns')
const driveRouter = Router()

const prettyBytes = require('pretty-bytes').default;
const storageController = require("../controllers/storageController")

function formatDate(date) {
  if (isToday(date)) {
    return format(date, 'h:mm a') // e.g. 2:30 PM
  } else {
    return format(date, 'MMM d, yyyy') // e.g. Jul 19, 2025
  }
}

const getModifiedFiles = async (userId, folderId) => {
  const files = await storageController.handleRetrieveFiles(userId, folderId);

  const modifiedFiles = files.map(file => {
    if (!file.id) {
      return {
        filename: file.name,
        folderId: file.folderId
      }
    }

    return {
      filename: file.name,
      created_at: formatDate(file.created_at),
      size: prettyBytes(file.metadata.size),
    }
  })

  return modifiedFiles;
}

driveRouter.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect('/log-in');
  } 

  next();
})

driveRouter.get("/my-drive", async (req, res) => {
  const userId = req.user.id;
  const folderId = -1;
  
  const files = await getModifiedFiles(userId, folderId);
  res.render("drive", { user: req.user, files: files });
})

driveRouter.post("/my-drive/create", async (req, res) => {
  const userId = req.user.id;
  const folderId = -1;
  const name = req.body.name;

  await storageController.handleCreateFolder(userId, folderId, name);

  res.redirect("/drive/my-drive")
})

driveRouter.post("/my-drive/upload", upload.single('uploaded_file'), async (req, res) => {
  const userId = req.user.id;
  const folderId = -1;
  const file = req.file;

  await storageController.handleUploadFile(userId, folderId, file)

  res.redirect('/drive/my-drive')
})

driveRouter.get("/folder/:folder", async (req, res) => {
  const userId = req.user.id;
  const folderId = req.params.folder;

  const files = await getModifiedFiles(userId, folderId);
  res.render("drive", { user: req.user, files: files, folderId: folderId });
})

driveRouter.post("/folder/:folder/create", async (req, res) => {
  const userId = req.user.id;
  const folderId = req.params.folder;
  const name = req.body.name;

  await storageController.handleCreateFolder(userId, folderId, name);

  const files = await getModifiedFiles(userId, folderId);
  res.render("drive", { user: req.user, files: files });
})

driveRouter.post("/folder/:folder/upload", upload.single('uploaded_file'), async (req, res) => {
  const userId = req.user.id;
  const folderId = req.params.folder;
  const file = req.file;

  await storageController.handleUploadFile(userId, folderId, file)

  const files = await getModifiedFiles(userId, folderId);
  res.status(200).render("drive", { user: req.user, files: files });
})

driveRouter.get("/", async (req, res) => {
  res.redirect("/drive/my-drive");
});

driveRouter.get("/{*splat}", async (req, res) => {
  res.status(404).send("<h1>404 ERROR: PAGE NOT FOUND 😞")
});

module.exports = driveRouter;