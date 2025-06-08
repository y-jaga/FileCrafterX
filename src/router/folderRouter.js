const express = require("express");

const {
  createFolder,
  updateFolder,
  deleteFolder,
  getFolder,
  getAllFolders,
} = require("../controller/folderController");

const router = express.Router();

//create a folder
//http://localhost:3000/folders/create
router.post("/create", createFolder);

//update a folder by id
//http://localhost:3000/folders/:folderId
router.put("/:folderId", updateFolder);

//delete a folder and all its file from db and cloudinary
//http://localhost:3000/folders/:folderId
router.delete("/:folderId", deleteFolder);

//get a folder by id
//http://localhost:3000/folders/:folderId
router.get("/:folderId", getFolder);

//get all folders
//http://localhost:3000/folders
router.get("/", getAllFolders);

module.exports = router;
