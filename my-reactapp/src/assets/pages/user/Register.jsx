import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../../../api/apiInstance";

const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Min 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Min 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Required"),
});

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onBlur",
  });

  // ── STEP 1: Submit registration form ──────────────────────────
  const userdetailsadd = async (data) => {
    try {
    await axiosInstance.post("/auth/register", {
  name: data.name,
  email: data.email,
  password: data.password,
});
      setEmail(data.email);
      toast.success("OTP sent to your email");
      setStep("otp");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error. Try again.");
    }
  };

  // ── STEP 2: Verify OTP and go straight to /home ───────────────
  const verifyOtp = async () => {
    if (otp.length !== 6) return toast.error("Enter a valid 6-digit OTP");
    try {
   await axiosInstance.post("/auth/verify-otp", { email, otp });
      toast.success("Welcome to Luxora!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────
  const resendOtp = async () => {
    setResending(true);
    try {
await axiosInstance.post("/auth/resend-otp", { email });
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  // ── OTP STEP UI ───────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0a07] px-4">
        <div className="w-full max-w-md bg-[#1a140e]/60 backdrop-blur-2xl border border-[#c8a97e]/20 shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-10">

          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif tracking-[0.15em] text-[#e6c89c] uppercase italic">
              Verify Email
            </h2>
            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-4">
              OTP sent to {email}
            </p>
            <div className="h-[1px] w-16 bg-[#c8a97e]/30 mx-auto mt-6" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70 ml-1">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none transition-all duration-700 placeholder:text-white/5 font-light text-sm tracking-[0.5em]"
              />
            </div>

            <button
              onClick={verifyOtp}
              className="w-full mt-4 py-4 bg-[#c8a97e] text-[#1a140e] text-[11px] tracking-[0.4em] uppercase font-bold hover:bg-[#f5deb3] transition-all duration-700 shadow-2xl active:scale-95"
            >
              Verify OTP
            </button>

            <button
              onClick={resendOtp}
              disabled={resending}
              className="w-full py-3 border border-[#c8a97e]/20 text-[#c8a97e]/60 text-[10px] tracking-[0.3em] uppercase hover:border-[#c8a97e]/50 hover:text-[#c8a97e] transition-all duration-500"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>

            <button
              onClick={() => setStep("register")}
              className="text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-white/50 transition-colors duration-500 mt-2"
            >
              ← Back to Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── REGISTER STEP UI ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a07] px-4">
      <div className="w-full max-w-md bg-[#1a140e]/60 backdrop-blur-2xl border border-[#c8a97e]/20 shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-10">

        <div className="text-center mb-10">
          <h2 className="text-2xl font-serif tracking-[0.15em] text-[#e6c89c] uppercase italic">
            Create Account
          </h2>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-4">
            Sign up to get started
          </p>
          <div className="h-[1px] w-16 bg-[#c8a97e]/30 mx-auto mt-6" />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(userdetailsadd)}>
          {["name", "email"].map((field) => (
            <div key={field} className="flex flex-col gap-1 group">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70 ml-1">
                {field}
              </label>
              <input
                {...register(field)}
                type={field === "email" ? "email" : "text"}
                placeholder={field === "name" ? "Michael" : "you@example.com"}
                className="placeholder:text-white/5 px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none transition-all duration-700 font-light text-sm"
              />
              {errors[field] && (
                <span className="text-red-400 text-xs mt-1">
                  {errors[field].message}
                </span>
              )}
            </div>
          ))}

          {["password", "confirmPassword"].map((field) => (
            <div key={field} className="flex flex-col gap-1 group">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70 ml-1">
                {field === "confirmPassword" ? "Confirm Password" : "Password"}
              </label>
              <input
                {...register(field)}
                type="password"
                placeholder="••••••••"
                className="px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none transition-all duration-700 placeholder:text-white/5 font-light text-sm"
              />
              {errors[field] && (
                <span className="text-red-400 text-xs mt-1">
                  {errors[field].message}
                </span>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 py-4 bg-[#c8a97e] text-[#1a140e] text-[11px] tracking-[0.4em] uppercase font-bold hover:bg-[#f5deb3] transition-all duration-700 shadow-2xl active:scale-95"
          >
            {isSubmitting ? "Sending OTP..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/30">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#c8a97e] hover:text-white transition-all duration-500 ml-1 border-b border-[#c8a97e]/40"
            >
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}