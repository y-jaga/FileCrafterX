const path = require("path");
const fs = require("fs");
const { Folder } = require("../../models");
const { requiredFileType } = require("../constants/file");

//requiredFileType : ["csv", "jpeg", "jpg", "png", "pdf", "pptx"]

//sample file looks like
// {
//   fieldname: 'files',
//   originalname: 'yogesh_backend.pdf',
//   encoding: '7bit',
//   mimetype: 'application/pdf'
// }

const fileTypeValidator = (file) => {
  const originalFileType = path.extname(file.originalname).toLowerCase(); //".pdf", ".pptx", ...
  const fileExt = originalFileType.split(".")[1]; //"pdf", "pptx", ...
  const fileMimeType = file.mimetype.split("/")[1]; // from "application/pdf" to "pdf"

  if (
    fileMimeType ===
    "vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    if (fileExt === "pptx" && requiredFileType.includes(fileExt)) {
      return true;
    }
  }

  return (
    requiredFileType.includes(fileExt) &&
    requiredFileType.includes(fileMimeType)
  );
};

async function folderExistsValidation(folderId) {
  const folder = await Folder.findOne({
    where: { folderId },
  });

  return folder;
}

async function removeFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

module.exports = { fileTypeValidator, folderExistsValidation, removeFile };
