import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  description: String,
  price: Number,
  originalPrice: { type: Number, default: 0 },      // ← add
  discountPercent: { type: Number, default: 0 },     // ← add
  image: String,
  qty: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);