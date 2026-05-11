// routes/user.routes.js
import express from "express";
// import User from "../models/User.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";
import { updateUserStatus, getusersAdmin ,updateUser,updateAdminPassword ,deleteUser} from "../controllers/user.controller.js"

const router = express.Router();

router.patch("/:id/status", protect, isAdmin, updateUserStatus)
router.get("/", protect, isAdmin, getusersAdmin);
router.patch("/:id", protect, updateUser);
router.patch("/admin/:id/change-password", protect, updateAdminPassword);
router.delete("/:id", protect, isAdmin, deleteUser);

export default router;