import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";

export const applycoupon = async (req, res) => {
  try {
    const { couponcode, items, total: passedTotal } = req.body;

    let total;

    // Buy Now flow — items sent directly from frontend
    if (items && items.length > 0) {
      total = passedTotal ?? items.reduce((acc, item) => acc + item.price * item.qty, 0);
    } else {
      // Regular cart flow — fetch from DB
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      total = cart.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: couponcode, active: true });
    if (!coupon) {
      return res.status(400).json({ message: "Coupon is invalid" });
    }

    // Calculate discount
    const discount = (total * coupon.discountpercent) / 100;
    const Finaltotal = total - discount;

    return res.json({
      message: "success",
      total,
      discount,
      Finaltotal,
      coupon: coupon.code,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Coupon failed" });
  }
};

export const getCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ _id: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountpercent, active } = req.body;

    if (!code || !discountpercent) {
      return res.status(400).json({ message: "Code and discount are required" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    await Coupon.create({
      code: code.toUpperCase().trim(),
      discountpercent,
      active: active ?? true,
    });

    res.status(201).json({ message: "Coupon created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};