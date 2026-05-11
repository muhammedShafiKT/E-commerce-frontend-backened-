import express from "express";
import {
  getLastDetails,
  getOrders,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getAllOrdersAdmin,
  deleteOrder
} from "../controllers/order.controller.js";
import { protect ,isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// user
router.get("/last-details", protect, getLastDetails); 
router.get("/", protect, getOrders);
router.post("/", protect, createOrder);
router.get("/adminorders", protect,getAllOrdersAdmin );

// admin
router.get("/admin/all", protect,isAdmin, getAllOrders);
router.patch("/admin/:orderId/status", protect, isAdmin, updateOrderStatus);
router.delete("/admin/:orderId", protect, isAdmin, deleteOrder);


export default router;