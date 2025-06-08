const { Folder } = require("../../models");
const { requiredFolderType } = require("../constants/file.js");
const { folderExistsValidation } = require("../utils/utility.js");

async function createFolderValidation(data) {
  if (!data.name || data.name.length === 0) {
    return "folder name is required";
  }

  const doesFolderNameExists = await Folder.findOne({
    where: {
      name: data.name,
    },
  });

  if (doesFolderNameExists) {
    return "folder name must be unique";
  }

  if (typeof data.maxFileLimit !== "number" || data.maxFileLimit < 0) {
    return "maxFileLimit must be positive number";
  }

  if (!requiredFolderType.includes(data.type)) {
    return `Invalid type: folder type must be one of ${requiredFolderType}`;
  }

  return null;
}

async function updateFolderValidation(folderId, dataToUpdate) {
  if (dataToUpdate.type) {
    return "Only folder name and/or maxFileLimit fields can be updated";
  }

  const doesFolderExists = await folderExistsValidation(folderId);
  if (!doesFolderExists) {
    return "Invalid folderId: folder does not exists";
  }

  if (
    typeof dataToUpdate.maxFileLimit !== "number" ||
    dataToUpdate.maxFileLimit < 0
  ) {
    return "Invalid maxFileLimit type or maxFileLimit can't be negative";
  }

  return null;
}

module.exports = {
  createFolderValidation,
  updateFolderValidation,
};
