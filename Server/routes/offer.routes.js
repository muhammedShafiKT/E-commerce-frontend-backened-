import express from "express";
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferForProduct,
} from "../controllers/offer.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/product/:productId", protect, getOfferForProduct); // product detail page
router.get("/",                   protect, isAdmin, getAllOffers);
router.post("/create",            protect, isAdmin, createOffer);
router.patch("/edit/:id",         protect, isAdmin, updateOffer);
router.delete("/delete/:id",      protect, isAdmin, deleteOffer);

export default router;