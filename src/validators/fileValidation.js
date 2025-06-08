const path = require("path");
const { File } = require("../../models/");
const { folderExistsValidation, removeFile } = require("../utils/utility");

const validateUploadFile = async (folderId, file) => {
  const fileExt = path.extname(file.originalname).toLowerCase().split(".")[1];

  const folder = await folderExistsValidation(folderId);
  if (!folder) {
    removeFile(file.path);
    return "Invalid folderId : folder does not exists";
  }

  const allowedTypes = {
    img: ["jpeg", "jpg", "png", "gif"],
    ppt: ["pptx"],
    csv: ["csv"],
    gif: ["gif"],
    pdf: ["pdf"],
  };

  if (
    !allowedTypes[folder.type] ||
    !allowedTypes[folder.type].includes(fileExt)
  ) {
    removeFile(file.path);
    return "File type mismatch: file type doesn't match with folder type";
  }

  const { count, rows } = await File.findAndCountAll({
    where: {
      folderId,
    },
  });

  if (count + 1 > folder.maxFileLimit) {
    removeFile(file.path);
    return "folder has reached maximum file limit";
  }

  if (file.size > 10 * 1024 * 1024) {
    removeFile(file.path);
    return "File size can be max 10 MB";
  }

  return null;
};

module.exports = { validateUploadFile };
