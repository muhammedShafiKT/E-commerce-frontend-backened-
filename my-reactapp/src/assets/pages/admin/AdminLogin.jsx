import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../../../api/apiInstance";

//validation

const adminLoginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function AdminLogin() {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(adminLoginSchema),
    mode: "onBlur",
  });

 const checkingfn = async (data) => {
  try {
    const res = await axiosInstance.post(
      "/auth/login",
      { email: data.email, password: data.password },
      { withCredentials: true }
    );

    const { role } = res.data;

    if (role === "superadmin") {
      toast.success("Welcome, Super Admin");
      nav("/superadmin/dashboard");
    } else if (role === "admin") {
      window.dispatchEvent(new Event("userLoggedIn"));
      toast.success("Welcome back, Admin");
      nav("/admin");
    } else {
      toast.error("Access denied.");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error(error.response?.data?.message || "Server error. Try again later.");
  }
  reset();
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a07] px-4 relative overflow-hidden">

     
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7c1a1a]/10 blur-[120px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#c8a97e]/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-[#1a140e]/60 backdrop-blur-2xl border border-[#c8a97e]/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-10 relative">

       //admin badge
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 bg-[#7c1a1a] border border-[#c8a97e]/30 px-4 py-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e6c89c] animate-pulse" />
            <span className="text-[9px] tracking-[0.35em] uppercase text-[#e6c89c] font-bold">
              Admin Access
            </span>
          </div>
        </div>

        <div className="text-center mb-10 mt-4">
          <h2 className="text-4xl font-serif tracking-[0.2em] text-[#e6c89c] uppercase italic">
            Sign In
          </h2>
          <div className="h-[1px] w-12 bg-[#c8a97e]/30 mx-auto mt-4" />
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(checkingfn)}>

          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-[#c8a97e]/70 ml-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="admin@example.com"
              className="px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none transition-all duration-700 placeholder:text-white/5 font-light"
            />
            {errors.email && (
              <span className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

         
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-[#c8a97e]/70 ml-1">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none transition-all duration-700 placeholder:text-white/5 font-light"
            />
            {errors.password && (
              <span className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-4 bg-[#7c1a1a] text-[#e6c89c] text-[11px] tracking-[0.4em] uppercase font-bold hover:bg-[#9b2222] transition-all duration-700 shadow-xl active:scale-95 border border-[#c8a97e]/20"
          >
            {isSubmitting ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>

        
        <div className="flex items-center gap-4 mt-10 mb-6">
          <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/20">or</span>
          <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
        </div>

        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-white/30">
          New admin?{" "}
          <Link
            className="text-[#c8a97e] hover:text-white transition-colors duration-500 ml-1 border-b border-[#c8a97e]/40"
            to="/admin/register"
          >
            Register here
          </Link>
        </p>

        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-white/20 mt-4">
          Not an admin?{" "}
          <Link
            className="text-white/40 hover:text-white/70 transition-colors duration-500 ml-1"
            to="/login"
          >
            User login
          </Link>
        </p>
      </div>
    </div>
  );
}