import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import SibApiV3Sdk from "@getbrevo/brevo";
dotenv.config();

// Brevo setup
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
brevoClient.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendOtp = async (email, otp) => {
  try {
    console.log("OTP email requested for:", email);
    const mail = new SibApiV3Sdk.SendSmtpEmail();
    mail.sender = { name: "Luxora", email: process.env.BREVO_SENDER_EMAIL };
    mail.to = [{ email }];
    mail.subject = "Your Luxora OTP";
    mail.htmlContent = `
      <div style="font-family: serif; padding: 20px;">
        <h2>Your OTP is <strong>${otp}</strong></h2>
        <p>This OTP expires in 1 minute.</p>
      </div>
    `;
    const result = await brevoClient.sendTransacEmail(mail);
    console.log("Brevo response:", result);
    return result;
  } catch (err) {
    console.error("Brevo error:", err);
    throw err;
  }
};

const issueTokens = (res, user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return { refreshToken, accessToken };
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const role =
      adminKey && adminKey === process.env.ADMIN_SECRET_KEY ? "admin" : "user";
    const isAdmin = role === "admin";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);

    if (existing && !existing.isVerified) {
      existing.name = name;
      existing.password = hashed;
      existing.otpCode = isAdmin ? undefined : otp;
      existing.otpExpiry = isAdmin ? undefined : otpExpiry;
      existing.isVerified = isAdmin;
      await existing.save();
    } else {
      await User.create({
        name,
        email,
        password: hashed,
        role,
        otpCode: isAdmin ? undefined : otp,
        otpExpiry: isAdmin ? undefined : otpExpiry,
        isVerified: isAdmin,
      });
    }

    if (!isAdmin) await sendOtp(email, otp);

    res.status(200).json({
      message: isAdmin ? "Admin account created" : "OTP sent to email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otpCode !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;

    const { refreshToken, accessToken } = issueTokens(res, user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Email verified.",
      role: user.role,
      id: user._id,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
    await user.save();

    await sendOtp(email, otp);
    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });
    if (user.status === "blocked")
      return res.status(403).json({ message: "Blocked user" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const { refreshToken, accessToken } = issueTokens(res, user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ role: user.role, id: user._id, accessToken });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Session expired, please log in again" });
  }
};

export const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    role: req.user.role,
    name: req.user.name,
    email: req.user.email,
    isGoogleUser: req.user.provider === "google",
  });
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
  } catch (_) {}

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });
  res.json({ message: "Logged out" });
};

export const googleCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=admin_blocked`);
  }

  const { refreshToken, accessToken } = issueTokens(res, req.user);
  req.user.refreshToken = refreshToken;
  await req.user.save();

  res.redirect(
    `${process.env.CLIENT_URL}/home?role=${req.user.role}&id=${req.user._id}&accessToken=${accessToken}`
  );
};