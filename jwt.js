require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateJwtToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
};

const payload = { lesson: "cloudinaryUpload" };
const token = generateJwtToken(payload);
console.log("Generated token:", token);
