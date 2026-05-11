// controllers/adminController.js
import User from "../models/User.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// POST /api/admin/create-admin  (superadmin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    const hashed = await bcrypt.hash(tempPassword, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      isVerified: true,   // superadmin vouches — no OTP needed
    });

    // Email the temp password to the new admin
    await transporter.sendMail({
      from: `"Luxora" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Luxora Admin Account",
      html: `
        <h2>Welcome, ${name}</h2>
        <p>Your admin account has been created.</p>
        <p>Temporary password: <strong>${tempPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      `,
    });

    res.status(201).json({ message: "Admin created and credentials emailed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/admins  (superadmin only)
export const listAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email status createdAt");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/admin/admins/:id/block  (superadmin only)
export const toggleAdminBlock = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "admin")
      return res.status(404).json({ message: "Admin not found" });

    admin.status = admin.status === "blocked" ? "active" : "blocked";
    await admin.save();
    res.json({ message: `Admin ${admin.status}`, status: admin.status });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/admins/:id  (superadmin only)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "admin")
      return res.status(404).json({ message: "Admin not found" });

    await admin.deleteOne();
    res.json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};