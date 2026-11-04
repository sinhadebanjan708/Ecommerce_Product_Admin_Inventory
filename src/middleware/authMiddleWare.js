/*const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};*/

const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};


exports.authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required"
      });
    }

    // Extract token
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing"
      });
    }

    // Verify access token
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );

    // Attach decoded payload to request
    req.user = decoded;

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token has expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        code: "INVALID_ACCESS_TOKEN",
        message: "Invalid access token"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized access"
    });
  }
};

// exports.authorizeRoles = (...roleConfigs) => {
//   return (req, res, next) => {
//      console.log("Authenticated user:", req.user);
//     console.log("User role:", req.user?.role);
//     console.log("User roles:", req.user?.roles);
//     const userRole = req.user.role || req.user.roles;
//     const allowedRoles = roleConfigs.map((r) => (typeof r === "string" ? r : r.role));

//     if (!allowedRoles.includes(userRole)) {
//       const matchedConfig = roleConfigs.find((r) => typeof r === "object" && r.role === userRole);
//       const customMessage =
//         matchedConfig?.message || `Access denied. Only ${allowedRoles.join(", ")} can access this. Please contact admin for permission`;
//       return res.status(403).json({
//         success: false,
//         message: customMessage,
//       });
//     }

//     next();
//   };
// };



exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("Authenticated user:", req.user);
    console.log("User role:", req.user?.role);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in."
      });
    }

    const userRole = String(req.user.role || "").toUpperCase();

    const normalizedAllowedRoles = allowedRoles.map(role =>
      String(role).toUpperCase()
    );

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${normalizedAllowedRoles.join(", ")} can access this.`
      });
    }

    next();
  };
};