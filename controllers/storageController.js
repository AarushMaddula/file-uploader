const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const fetchFolderPath = async (folderId) => {
  if (folderId === -1) return "";

  const { data, error } = await supabase
    .from("folders")
    .select()
    .eq("id", folderId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("Error:", error.message, folderId);
    throw new Error("Error fetching parent folder path");
  }

  return data.path;
};

const fetchFiles = async (userId, path) => {
  const { data, error } = await supabase.storage.from(userId).list(path, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to retrieve user files!");
  }

  return data;
};

const fetchFolderId = async (userId, path) => {
  if (!path) return -1;

  const { data, error } = await supabase
    .from("folders")
    .select("id")
    .eq("user_id", userId)
    .eq("path", path)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to retrieve folder path!");
  }

  return data.id;
};

const uploadFile = async (userId, path, file) => {
  const { error } = await supabase.storage
    .from(userId)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to retrieve user bucket!");
  }
};

const insertFolder = async (userId, path) => {
  const { error } = await supabase.from("folders").insert({
    path: path,
    user_id: userId,
  });

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Error inserting folder path");
  }
};

const createFolder = async (userId, path) => {
  const { error } = await supabase.storage
    .from(userId)
    .upload(`${path}/.placeholder`);

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Error generating folder");
  }
};

const createUserBucket = async (userId) => {
  const { error } = await supabase.storage.createBucket(userId, {
    public: false,
    fileSizeLimit: "10MB",
  });

  if (error) {
    console.log("Error:", error.message, userId);
    throw new Error("Unable to create new user bucket!");
  }
};

exports.handleCreateUserBucket = async (userId) => {
  await createUserBucket(userId);
};

exports.handleCreateFolder = async (userId, folderId, name) => {
  const parentFolderPath = await fetchFolderPath(folderId);
  const folderPath = `${parentFolderPath ? parentFolderPath + "/" : ""}${
    name || "folder"
  }`;

  const folderExists = await fetchFolderId(folderPath);
  if (folderExists) throw new Error("Folder Already Exists!");

  await insertFolder(userId, folderPath);
  await createFolder(userId, folderPath);
};

exports.handleUploadFile = async (userId, folderId, file) => {
  const parentFolderPath = await fetchFolderPath(folderId);
  const filePath = `${parentFolderPath ? parentFolderPath + "/" : ""}${
    file.originalname || "uploaded-file.txt"
  }`;

  await uploadFile(userId, filePath, file);
};

exports.handleRetrieveFiles = async (userId, folderId) => {
  const parentFolderPath = await fetchFolderPath(folderId);
  const files = (await fetchFiles(userId, parentFolderPath)) || [];

  for (const file of files) {
    if (file.id) continue;

    const filename = file.name;
    const path = `${parentFolderPath ? parentFolderPath + "/" : ""}${filename}`;

    file.folderId = await fetchFolderId(userId, path);
  }

  return files;
};

exports.handleRetrievePathLinks = async (userId, folderId) => {
  const path = await fetchFolderPath(folderId);
  const folderNames = path ? ["", ...path.split("/")] : [""];
  const folders = [];

  let currentPath = "";

  for (let i = 0; i < folderNames.length; i++) {
    currentPath += currentPath === "" ? folderNames[i] : `/${folderNames[i]}`;

    let link;

    if (i === folderNames.length - 1) {
      link = {
        name: folderNames[i] || "My Drive",
      };
    } else {
      const folderId = await fetchFolderId(userId, currentPath);

      link = {
        name: folderNames[i] || "My Drive",
        url: folderNames[i] ? `/drive/folder/${folderId}` : "/drive/my-drive",
      };
    }

    folders.push(link);
  }

  return folders;
};
