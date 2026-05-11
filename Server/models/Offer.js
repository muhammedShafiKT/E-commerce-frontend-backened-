import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },        // "Summer Sale", "BOGO Shoes"
    type: {
      type: String,
      enum: ["product", "category", "flash", "bogo"],
      required: true,
    },

    // For product-level & flash offers
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },

    // For category-wide offers
    category: { type: String, default: null },

    // Discount percent (used by product / category / flash)
    discountPercent: { type: Number, default: 0 },  // 0–100

    // BOGO config: buy X quantity, get Y free
    bogoConfig: {
      buyQty:  { type: Number, default: 2 },
      getFree: { type: Number, default: 1 },
    },

    active: { type: Boolean, default: true },

    // Flash sale window (optional — admin can also just toggle active)
    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);