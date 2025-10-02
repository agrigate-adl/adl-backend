const jwt = require("jsonwebtoken");
const db = require("../app/models/index");

const config = process.env;
const Users = db.Users;

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);

    // Check if user still exists and is not suspended
    const user = await Users.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.suspended) {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
        code: "USER_SUSPENDED",
      });
    }

    req.user = decoded;
    req.userData = user; // Add user data to request for future use
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
