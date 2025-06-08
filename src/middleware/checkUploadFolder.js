const fs = require("fs");
const path = require("path");

const doesUploadFolderExists = (req, res, next) => {
  const uploadDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  next();
};

module.exports = { doesUploadFolderExists };
