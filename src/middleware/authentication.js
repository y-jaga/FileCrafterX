require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const authenticateJwt = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; //"Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ error: "jwt token is missing" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    console.log(decoded);
    if (err) {
      return res
        .status(403)
        .json({ error: "Authentication failed: Token is invalid" });
    }
    //e.g. decoded: { lesson: 'cloudinaryUpload', iat: 1749553698, exp: 1749560898 }
    req.user = decoded;
    next();
  });
};

module.exports = { authenticateJwt };
