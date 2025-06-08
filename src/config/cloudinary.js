require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const generateSignature = (paramsToSign) => {
  const api_secret = cloudinary.config().api_secret;
  const signature = cloudinary.utils.api_sign_request(paramsToSign, api_secret);
  return signature;
};

const cloudinaryUpload = async (filePath) => {
  cloudinaryConfig();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = { timestamp };
  const signature = generateSignature(paramsToSign);
  const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
  });
  return cloudinaryResponse;
};

const cloudinaryDestroy = async (publicId) => {
  try {
    cloudinaryConfig();
    console.log("deleting files from cloudinary...");
    console.log(publicId);
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error("cloudinary error", error);
    throw error;
  }
};

module.exports = { cloudinaryUpload, cloudinaryDestroy };
