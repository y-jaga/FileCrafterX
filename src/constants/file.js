const requiredFileType = ["csv", "jpeg", "jpg", "png", "gif", "pdf", "pptx"];
const requiredFolderType = ["csv", "img", "pdf", "pptx"];

const UNEXPECTED_FILE_TYPE = {
  code: "UNEXPECTED_FILE_TYPE",
  message: `Only ${requiredFileType} file types is allowed.`,
};

module.exports = { requiredFolderType, requiredFileType, UNEXPECTED_FILE_TYPE };
