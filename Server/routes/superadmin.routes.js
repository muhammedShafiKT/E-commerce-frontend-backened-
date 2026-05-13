// routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js"; // your existing JWT middleware
import { requireSuperAdmin } from "../middleware/auth.middleware.js";
import {
  createAdmin,
  listAdmins,
  toggleAdminBlock,
  deleteAdmin,
} from "../controllers/superadmin.controlller.js";

const router = express.Router();

// All routes will use this
router.use(protect, requireSuperAdmin);

router.post("/create-admin", createAdmin);
router.get("/admins", listAdmins);
router.patch("/admins/:id/block", toggleAdminBlock);
router.delete("/admins/:id", deleteAdmin);

export default router;  