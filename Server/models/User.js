import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    status: {
      type: String,
      default: "active",
    },
    provider: { type: String, default: "local" },

    otpCode: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);