import express from "express";
import passport from "../config/passport.js";
import {
  registerUser, loginUser, logoutUser,
  getMe, verifyOtp, resendOtp, googleCallback,refreshAccessToken
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.post("/refresh", refreshAccessToken);

// Google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  googleCallback
);

export default router;