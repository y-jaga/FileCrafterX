const { cloudinaryUpload } = require("../config/cloudinary");
const { removeFile } = require("../utils/utility");

const uploadToCloudinary = async (file) => {
  try {
    const cloudinaryResponse = await cloudinaryUpload(file.path);

    //remove uploaded file after uploading it to cloudinary
    removeFile(file.path);

    return cloudinaryResponse;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { uploadToCloudinary };
