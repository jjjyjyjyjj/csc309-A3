const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require("../config/jwt");

// verifies token and put user info into req
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader|| !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
    // return next();
  }
  // console.log("authHead checked: ", authHeader);
  const token = authHeader.slice(7);

  try {
    // console.log("SECRET_KEY:", SECRET_KEY);
    const decoded = jwt.verify(token, SECRET_KEY);
    // console.log("jwt verified");
    // console.log("decoded", decoded);

    req.user = decoded; // { userId,  email, role }
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// does the same thing as authenticate except it allows ppl to pass
const authenticatePass = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader|| !authHeader.startsWith("Bearer ")) {
    // return res.status(401).json({ error: "Authentication required" });
    return next();
  }
  console.log("authHead checked: ", authHeader);
  const token = authHeader.slice(7);

  try {
    console.log("SECRET_KEY:", SECRET_KEY);
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("jwt verified");
    console.log("decoded", decoded);

    req.user = decoded; // { userId,  email, role }
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// check if authenticated user has the correct role for the function 
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};

module.exports = { authenticate, requireRole, authenticatePass };