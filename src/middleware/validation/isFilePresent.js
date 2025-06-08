const isFilePresent = async (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({
      error: { description: "File not present in the request body." },
    });
  }
  if (Array.isArray(req.files) && req.files.length === 0) {
    return res
      .status(400)
      .json({ error: { description: "No file uploaded." } });
  }

  next();
};

module.exports = { isFilePresent };
