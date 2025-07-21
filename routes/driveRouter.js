const { Router } = require("express")
const multer  = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { format, isToday, nextDay } = require('date-fns')
const driveRouter = Router()

const prettyBytes = require('pretty-bytes').default;
const storageController = require("../controllers/storageController")

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
      created_at: format(file.created_at, 'Pp'),
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
  const links = await storageController.handleRetrievePathLinks(userId, folderId);
  res.render("drive", { user: req.user, files: files, links: links });
})

driveRouter.post("/my-drive/create", async (req, res) => {
  const userId = req.user.id;
  const folderId = -1;
  const name = req.body.name;

  try {
    await storageController.handleCreateFolder(userId, folderId, name);
    res.status(201).redirect("/drive/my-drive");
  } catch (err) {
    console.error("Create folder error:", err.message);
    res.status(400).redirect("/drive/my-drive");
  }
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
  const links = await storageController.handleRetrievePathLinks(userId, folderId);
  res.render("drive", { user: req.user, files: files, links: links });
})

driveRouter.post("/folder/:folder/create", async (req, res) => {
  const userId = req.user.id;
  const folderId = req.params.folder;
  const name = req.body.name;

  try {
    await storageController.handleCreateFolder(userId, folderId, name);
    res.status(201).redirect(`/folder/${folderId}`);
  } catch (err) {
    console.error("Create folder error:", err.message);
    res.status(400).redirect(`/folder/${folderId}`);
  }
})

driveRouter.post("/folder/:folder/upload", upload.single('uploaded_file'), async (req, res) => {
  const userId = req.user.id;
  const folderId = req.params.folder;
  const file = req.file;

  await storageController.handleUploadFile(userId, folderId, file)

  res.redirect(`/folder/${folderId}`);
})

driveRouter.get("/", async (req, res) => {
  res.redirect("/drive/my-drive");
});

driveRouter.get("/{*splat}", async (req, res) => {
  res.status(404).send("<h1>404 ERROR: PAGE NOT FOUND 😞")
});

module.exports = driveRouter;