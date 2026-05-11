import { razorpay } from "../config/razorpay.js";
import Order from "../models/Order.js";
import crypto from "crypto";
import dotenv from "dotenv"
dotenv.config()
//razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    //  Check incoming request
    console.log("REQ BODY:", req.body);

    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.log("INVALID AMOUNT:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

   
    // console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
    // console.log("SECRET:", process.env.RAZORPAY_SECRET ? "EXISTS" : "MISSING");

   // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    // console.log("ORDER CREATED:", order);

    res.json(order);

  } catch (err) {
  
    console.error("RAZORPAY ERROR:", err);

    res.status(500).json({
      error: "Failed to create order",
      details: err.message,
    });
  }
};

//verify payment signtre
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Just confirm verification  order saving is done by placeOrder() in frontend
    res.json({ success: true });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};