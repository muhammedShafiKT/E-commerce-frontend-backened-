import express from "express";
import {
  getProducts,
  allproducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
} from "../controllers/product.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/",protect, getProducts);                                          // public
router.get("/admin/all", allproducts);                                 // admin — no protect to avoid token issues
router.post("/", protect, upload.single("image"), createProduct);
router.get("/:id", getProductById);
router.put("/:id", protect, upload.single("image"), updateProduct);
router.delete("/:id", protect, deleteProduct);
router.patch("/:id/toggle-visibility", toggleProductVisibility);

export default router;