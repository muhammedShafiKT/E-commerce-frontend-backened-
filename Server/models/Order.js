import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    orderId: {
      type: String,
      unique: true,
    },

    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        description: String,
        price: Number,
        image: String,
        qty: Number,
      },
    ],

    total: Number,

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

  status: {
  type: String,
  enum: ["pending", "created", "processing", "shipped", "delivered", "cancelled","paid"],
  default: "pending",
},

    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);