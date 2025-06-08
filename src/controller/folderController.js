const { Folder } = require("../../models");
const { File } = require("../../models");
const { cloudinaryDestroy } = require("../config/cloudinary");
const { folderExistsValidation } = require("../utils/utility");
const {
  createFolderValidation,
  updateFolderValidation,
} = require("../validators/folderValidation");

const createFolder = async (req, res) => {
  try {
    const data = req.body;
    const error = await createFolderValidation(data);

    if (error && error.length !== 0) {
      return res.status(400).json({ error });
    }

    const response = await Folder.create(data);

    res
      .status(201)
      .json({ message: "Folder created successfully", folder: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateFolder = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const dataToUpdate = req.body;

    const error = await updateFolderValidation(folderId, dataToUpdate);
    if (error && error.length !== 0) {
      return res.status(400).json({ error });
    }

    const folder = await Folder.findOne({
      where: { folderId },
    });

    folder.set(dataToUpdate);

    await folder.save();

    res.status(200).json({ message: "Folder updated successfully", folder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const error = await folderExistsValidation(folderId);

    if (!error) {
      return res
        .status(400)
        .json({ error: "Invalid folderId : folder does not exists" });
    }

    const files = await File.findAll({
      where: {
        folderId,
      },
    });

    //deletes all files within folder and files from cloudinary
    await Promise.all(
      files.map(async (file) => {
        await cloudinaryDestroy(file.publicId);
        await File.destroy({
          where: { fileId: file.fileId },
        });
      })
    );

    // delete the folder
    await Folder.destroy({
      where: { folderId },
    });

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getFolder = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const error = await folderExistsValidation(folderId);

    if (!error) {
      return res
        .status(400)
        .json({ error: "Invalid folderId : folder does not exists" });
    }

    const folders = await Folder.findOne({
      where: { folderId },
    });

    res.status(200).json({ folders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.findAll();

    if (folders.length === 0) {
      return res.status(404).json({ error: "No folders found." });
    }

    res.status(200).json({ folders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFolder,
  updateFolder,
  deleteFolder,
  getFolder,
  getAllFolders,
};
