import express from "express";
import { getAdminStats, getRevenueChart } from "../controllers/admin.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js"; // adjust path as needed

const router = express.Router();

// Both routes are protected — only admins can access
router.get("/stats", protect, isAdmin, getAdminStats);
router.get("/revenue", protect, isAdmin, getRevenueChart);

export default router;