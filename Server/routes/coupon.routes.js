import express from "express"
import { applycoupon ,getCoupon ,
    createCoupon ,updateCoupon ,deleteCoupon} from "../controllers/coupon.controller.js";
import { protect ,isAdmin  } from "../middleware/auth.middleware.js";
const router = express.Router()
router.post("/apply",protect,applycoupon)
router.get("/",protect,isAdmin,getCoupon)
router.post("/create",protect,isAdmin,createCoupon,)
router.patch("/edit/:id",protect,isAdmin,updateCoupon)
router.delete("/delete/:id",protect,isAdmin,deleteCoupon)
export default router