const { Op } = require("sequelize");
const { File } = require("../../models");
const { cloudinaryDestroy } = require("../config/cloudinary");
const { uploadToCloudinary } = require("../services/fileService");
const { validateUploadFile } = require("../validators/fileValidation");
const { folderExistsValidation } = require("../utils/utility");

//creates a file in File model as well as upload it to cloudinary
const uploadFile = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const file = req.files[0];
    //add body data in : Body > form-data, Key : data, value : {req.body data}
    const uploadData = JSON.parse(req.body.data); // {"file" : "file_to_upload.csv", "description" : "Monthly budget report"}

    const error = await validateUploadFile(folderId, file);
    if (error) {
      return res.status(400).json({ error });
    }

    const mimeType = {
      csv: "application/csv",
      jpeg: "image/jpeg",
      jpg: "image/jpg",
      png: "image/png",
      gif: "image/gif",
      pdf: "application/pdf",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    const fileExt = uploadData.file.split(".")[1].toLowerCase();

    const fileType = mimeType[fileExt];

    const fileData = {
      folderId: folderId,
      name: uploadData.file,
      description: uploadData.description,
      type: fileType,
      size: file.size,
    };

    //upload file to cloudinary
    const cloudinaryResponse = await uploadToCloudinary(file);

    //fetch public_id from cloudinary response
    fileData.publicId = cloudinaryResponse.public_id;

    const response = await File.create(fileData);
    res.status(201).json({
      message: "File uploaded successfully",
      file: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateFileDescription = async (req, res) => {
  try {
    const { folderId, fileId } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description is required." });
    }

    const file = await File.findOne({
      where: {
        fileId,
        folderId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: "File does not exists in the specified folder." });
    }

    file.description = description;

    await file.save();

    res
      .status(201)
      .json({ message: "File description updated successfully", file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { folderId, fileId } = req.params;

    const file = await File.findOne({
      where: {
        fileId,
        folderId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: "File does not exists in the specified folder." });
    }

    //delete file from cloudinary
    await cloudinaryDestroy(file.publicId);

    //delete file from database
    await file.destroy();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getFilesByFolderId = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    if (!folderId) {
      return res.status(400).json({ error: "folderId is required." });
    }

    const folder = await folderExistsValidation(folderId);
    if (!folder) {
      return res.status(404).json({ error: "folder does not exists." });
    }

    const files = await File.findAll({
      where: { folderId },
    });

    if (files.length === 0) {
      return res.status(404).json({ error: "No files found." });
    }

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAndSortFiles = async (req, res) => {
  try {
    const sortParam = req.query.sort;
    const folderId = req.params.folderId;

    if (!folderId) {
      return res.status(400).json({ error: "folderId is required." });
    }

    const folder = await folderExistsValidation(folderId);
    if (!folder) {
      return res.status(404).json({ error: "folder does not exists." });
    }

    const files = await File.findAll({
      where: { folderId },
      order: [[sortParam, "ASC"]],
    });

    if (files.length === 0) {
      return res.status(404).json({ error: "No files found." });
    }

    res.status(200).json({ files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getFilesByType = async (req, res) => {
  try {
    const searchType = req.query.type.toLowerCase();

    const files = await File.findAll({
      where: {
        type: {
          [Op.like]: `%${searchType}%`,
        },
      },
    });

    if (files.length === 0) {
      return res.status(404).json({ error: "No files found." });
    }

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getFileMetaData = async (req, res) => {
  try {
    const { folderId } = req.params;
    if (!folderId) {
      return res.status(400).json({ error: "folderId is required." });
    }

    const folder = await folderExistsValidation(folderId);
    if (!folder) {
      return res.status(404).json({ error: "folder does not exists." });
    }

    const files = await File.findAll({
      where: { folderId },
    });

    if (files.length === 0) {
      return res.status(404).json({ error: "No files found." });
    }

    const filesMetaData = files.map((file) => {
      return {
        fileId: file.fileId,
        name: file.name,
        size: file.size,
        description: file.description,
      };
    });

    res.status(200).json({ files: filesMetaData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  updateFileDescription,
  deleteFile,
  getFilesByFolderId,
  getAndSortFiles,
  getFilesByType,
  getFileMetaData,
};
