import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: String,
    category: String,
    description: String,

    price: { type: Number, required: true },

    stock: { type: Number, default: 0 },

    images: {
      type: [String], 
      default: [],
    },
    isHidden: { type: Boolean, default: false },
  },

  
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);