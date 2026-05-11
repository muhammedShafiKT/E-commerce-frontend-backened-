import express from "express";
import {
  getCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
  clearCart
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/increase", protect, increaseQty);
router.put("/decrease", protect, decreaseQty);
router.delete("/:productId", protect, removeItem);
router.delete("/", protect, clearCart); // ✅ added

export default router;