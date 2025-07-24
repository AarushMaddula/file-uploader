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

const fetchFilePath = async (fileId) => {
  const { data, error } = await supabase
    .from("files")
    .select()
    .eq("id", fileId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("Error:", error.message, fileId);
    throw new Error("Error fetching file path");
  }

  return data.path;
};

const fetchFile = async (userId, path) => {
  const { data, error } = await supabase
    .storage
    .from(userId)
    .download(path)

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to retrieve user files!");
  }

  return data;
}

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
    throw new Error("Unable to retrieve folder id!");
  }


  return data.id;
};

const fetchFileId = async (userId, path) => { 
  const { data, error } = await supabase
    .from("files")
    .select("id")
    .eq("user_id", userId)
    .eq("path", path)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to retrieve file id!");
  }

  return data?.id || -1;
};

const uploadFile = async (userId, path, file) => {
  const { error } = await supabase.storage
    .from(userId)
    .upload(path, file, {
      upsert: true,
    });

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to retrieve user bucket!");
  }
};

const insertFolder = async (userId, path) => {
  const { error } = await supabase
    .from("folders")
    .insert({
      path: path,
      user_id: userId,
    });

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Error inserting folder path");
  }
};

const insertFile = async (userId, path) => {
  const { error } = await supabase
    .from("files")
    .insert({
      path: path,
      user_id: userId,
    });

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Error inserting file path");
  }
};

const createFolder = async (userId, path) => {
  const { error } = await supabase.storage
    .from(userId)
    .upload(`${path}/.emptyFolderPlaceholder`);

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

const deleteFile = async (userId, path) => {
  const { error } = await supabase
    .storage
    .from(userId)
    .remove([path])

  if (error) {
    console.log("Error:", error.message, userId, path);
    throw new Error("Unable to delete file!");
  }
}

const deleteFolder = async (userId, childrenPaths) => {
  const { error } = await supabase
    .storage
    .from(userId)
    .remove(childrenPaths)

  if (error) {
    console.log("Error:", error.message, userId, childrenPaths);
    throw new Error("Unable to delete folder!");
  }
}

const fetchChildrenFilePaths = async (userId, path) => {
  const queue = [path];
  const filePaths = [];

  while (queue.length > 0) {
    const currentPath = queue.shift();

    const allFiles = await fetchFiles(userId, currentPath);

    allFiles.forEach(file => {
      if (file.id) {
        filePaths.push(`${currentPath}/${file.name}`);
      } else {
        queue.push(`${currentPath}/${file.name}`);
      }
    });
  }

  return filePaths;
}

const removeFolder = async (userId, path) => {
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("user_id", userId)
    .eq("path", path)

  if (error) {
    console.log("Error:", error.message);
    throw new Error("Error deleting folder path");
  }
};

const removeFile = async (userId, path) => {

  const { error } = await supabase
    .from("files")
    .delete()
    .eq("user_id", userId)
    .eq("path", path)

  if (error) {
    console.log("Error:", error.message);
    throw new Error("Error deleting file path");
  }
};

const updateFile = async (fileId, path) => {
   const { error } = await supabase
    .from('files')
    .update({ path: path })
    .eq('id', fileId)

  if (error) {
    console.log("Error:", error.message);
    throw new Error("Error updating file path");
  } 
}

const updateFolder = async (folderId, path) => {
   const { error } = await supabase
    .from('folders')
    .update({ path: path })
    .eq('id', folderId)

  if (error) {
    console.error("Error:", error.message);
    throw new Error("Error updating folder path");
  }
}

const getFileNameFromPath = (path) => {
  const index = path.lastIndexOf("/");
  const filename = index !== -1 ? path.slice(index) : path;

  return filename;
}

const getParentFolder = (path) => {
  const index = path.lastIndexOf("/");
  const folderPath = index !== -1 ? path.slice(0, index) : "";

  return folderPath;
}

const getUserFolders = async (userId) => {
  const { data, error } = await supabase
    .from('folders')
    .select('id, path')
    .eq('user_id', userId)

  if (error) {
    console.log("Error:", error.message);
    throw new Error("Error updating file path");
  } 

  return data;
}

exports.handleCreateUserBucket = async (userId) => {
  await createUserBucket(userId);
};

exports.handleCreateFolder = async (userId, folderId, name) => {
  const parentFolderPath = await fetchFolderPath(folderId);
  const folderPath = `${parentFolderPath ? parentFolderPath + "/" : ""}${
    name || "folder"
  }`;

  const folderExists = (await fetchFolderId(folderPath)) !== -1;
  if (folderExists) throw new Error("Folder Already Exists!");

  await insertFolder(userId, folderPath);
  await createFolder(userId, folderPath);
};

exports.handleUploadFile = async (userId, folderId, file) => {
  const parentFolderPath = await fetchFolderPath(folderId);
  const filePath = `${parentFolderPath ? parentFolderPath + "/" : ""}${
    file.originalname || "uploaded-file.txt"
  }`;

  await uploadFile(userId, filePath, file.buffer);
  await insertFile(userId, filePath);
};

exports.handleDownloadFile = async (userId, fileId) => {
  const filePath = await fetchFilePath(fileId);
  const file = await fetchFile(userId, filePath);
  const filename = getFileNameFromPath(filePath);

  file.filename = filename

  return file;
}

exports.handleRetrieveFiles = async (userId, folderId) => {
  const parentFolderPath = await fetchFolderPath(folderId);
  const files = (await fetchFiles(userId, parentFolderPath)) || [];

  const filteredFiles = files.filter(file => file.name !== ".emptyFolderPlaceholder");

  for (const file of filteredFiles) {
    const filename = file.name;
    const path = `${parentFolderPath ? parentFolderPath + "/" : ""}${filename}`;

    const isFolder = !file.id;

    file.isFolder = isFolder;
    file.id = isFolder ? await fetchFolderId(userId, path) : await fetchFileId(userId, path);
  }

  return filteredFiles;
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

exports.handleDeleteFile = async (userId, fileId) => {
  const filePath = await fetchFilePath(fileId);
  
  await deleteFile(userId, filePath);
  await removeFile(userId, filePath);
}

exports.handleDeleteFolder = async (userId, folderId) => {
  const folderPath = await fetchFolderPath(folderId);
  const childrenPaths = await fetchChildrenFilePaths(userId, folderPath) || [];

  await deleteFolder(userId, childrenPaths);
  await removeFolder(userId, folderPath);

  for (const childPath of childrenPaths) {
    await removeFile(userId, childPath);
  }
}

exports.handleRenameFile = async (userId, fileId, name) => {
  const filePath = await fetchFilePath(fileId);
  const parentFolderPath = getParentFolder(filePath);
  const updatedFilePath = `${parentFolderPath ? parentFolderPath + "/" : ""}${name}`;

  const file = await fetchFile(userId, filePath);

  await deleteFile(userId, filePath);
  await uploadFile(userId, updatedFilePath, file);
  await updateFile(fileId, updatedFilePath);
}

exports.handleRenameFolder = async (userId, folderId, name) => {
  const folderPath = await fetchFolderPath(folderId);
  const parentFolderPath = getParentFolder(folderPath);
  const updatedFolderPath = `${parentFolderPath ? parentFolderPath + "/" : ""}${name}`;
  const childrenFilePaths = await fetchChildrenFilePaths(userId, folderPath);

  for (const filePath of childrenFilePaths) {
    const fileId = await fetchFileId(userId, filePath);
    const updatedFilePath = filePath.replace(folderPath, updatedFolderPath);

    const file = await fetchFile(userId, filePath);

    await deleteFile(userId, filePath);
    await uploadFile(userId, updatedFilePath, file);

    // is this a placeholder
    if (fileId !== -1) await updateFile(fileId, updatedFilePath);
  }

  const childFolders = await getUserFolders(userId);

  for (const childFolder of childFolders) {
    const childFolderPath = childFolder.path;
    const childFolderId = childFolder.id;
    const updatedChildFolderPath = childFolderPath.replace(folderPath, updatedFolderPath);

    await updateFolder(childFolderId, updatedChildFolderPath);
  }

}