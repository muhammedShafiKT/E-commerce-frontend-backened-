import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import * as Brevo from "@getbrevo/brevo";
dotenv.config();

// Brevo setup
const brevoClient = new Brevo.TransactionalEmailsApi();
brevoClient.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const createAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    const hashed = await bcrypt.hash(tempPassword, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      isVerified: true,
    });

    const mail = new Brevo.SendSmtpEmail();
    mail.sender = { name: "Luxora", email: process.env.BREVO_SENDER_EMAIL };
    mail.to = [{ email, name }];
    mail.subject = "Your Luxora Admin Account";
    mail.htmlContent = `
      <div style="font-family: serif; padding: 20px;">
        <h2>Welcome, ${name}</h2>
        <p>Your admin account has been created.</p>
        <p>Temporary password: <strong>${tempPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      </div>
    `;

    await brevoClient.sendTransacEmail(mail);

    res.status(201).json({ message: "Admin created and credentials emailed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select(
      "name email status createdAt"
    );
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

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