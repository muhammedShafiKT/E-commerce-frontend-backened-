import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // ✅ Accept token from cookie OR Authorization header
    const token = req.cookies.token || 
      (req.headers.authorization?.startsWith("Bearer ") 
        ? req.headers.authorization.split(" ")[1] 
        : null);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Access denied" });
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin")
    return res.status(403).json({ message: "Superadmin access only" });
  next();
};