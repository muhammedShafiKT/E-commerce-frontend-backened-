// scripts/seedSuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ role: "superadmin" });
  if (existing) {
    console.log("Super admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);
  await User.create({
    name: "Super Admin",
    email: process.env.SUPERADMIN_EMAIL,
    password: hashed,
    role: "superadmin",
    isVerified: true,
  });

  console.log("Super admin created");
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });