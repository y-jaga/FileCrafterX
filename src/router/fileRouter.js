const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerFileUpload");
const multer = require("multer");
const {
  uploadFile,
  updateFileDescription,
  deleteFile,
  getFilesByFolderId,
  getAndSortFiles,
  getFilesByType,
  getFileMetaData,
} = require("../controller/fileController");
const { UNEXPECTED_FILE_TYPE } = require("../constants/file");
const { isFilePresent } = require("../middleware/validation/isFilePresent");
const { authenticateJwt } = require("../middleware/authentication");
const { doesUploadFolderExists } = require("../middleware/checkUploadFolder");

//uploads file to cloudinary
//http://localhost:3000/folder-files/:folderId/files
router.post(
  "/:folderId/files",
  authenticateJwt,
  doesUploadFolderExists,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === UNEXPECTED_FILE_TYPE.code) {
          return res.status(400).json({ error: { description: err.field } });
        }
      } else if (err) {
        return res.status(500).json({ error: { description: err.message } });
      }
      next();
    });
  },
  isFilePresent,
  uploadFile
);

//update file description
//http://localhost:3000/folder-files/:folderId/files/:fileId
router.put("/:folderId/files/:fileId", updateFileDescription);

//delete a file
//http://localhost:3000/folder-files/:folderId/files/:fileId
router.delete("/:folderId/files/:fileId", deleteFile);

//get files from a folder
//http://localhost:3000/folder-files/:folderId/files
router.get("/:folderId/files", getFilesByFolderId);

//get and sort files by size and recency(uploadedAt) both
//http://localhost:3000/folder-files/:folderId/filesBySort?sort=size
//http://localhost:3000/folder-files/:folderId/filesBySort?sort=uploadedAt
router.get("/:folderId/filesBySort", getAndSortFiles);

//get files by type
//http://localhost:3000/folder-files/files/by-type?type=pdf
router.get("/files/by-type", getFilesByType);

//get file metadata
//http://localhost:3000/folder-files/:folderId/metadata
router.get("/:folderId/metadata", getFileMetaData);

module.exports = router;
