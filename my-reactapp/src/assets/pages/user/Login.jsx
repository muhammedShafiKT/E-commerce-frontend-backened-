import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../../../api/apiInstance";


const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
  });

const checkingfn = async (data) => {
  try {
    const res = await axiosInstance.post("/auth/login", {
      email: data.email,
      password: data.password,
    });

    const { role, accessToken } = res.data;

    // ✅ Store token and role
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", role);

    window.dispatchEvent(new Event("userLoggedIn"));
    toast.success("Login successful");

    if (role === "admin") {
      nav("/admin");
    } else {
      nav("/home");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error(error.response?.data?.message || "Server error. Try again later.");
  }
  reset();
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a07] px-4">
      <div className="w-full max-w-md bg-[#1a140e]/60 backdrop-blur-2xl border border-[#c8a97e]/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-10">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif tracking-[0.2em] text-[#e6c89c] uppercase italic">
            Login
          </h2>
          <div className="h-[1px] w-12 bg-[#c8a97e]/30 mx-auto mt-4" />
        </div>

        {/* FORM */}
        <form className="space-y-8" onSubmit={handleSubmit(checkingfn)}>
          
          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-[#c8a97e]/70 ml-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none transition-all duration-700 placeholder:text-white/5 font-light"
            />
            {errors.email && (
              <span className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* PASSWORD */}
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-4 bg-[#c8a97e] text-[#1a140e] text-[11px] tracking-[0.4em] uppercase font-bold hover:bg-[#f5deb3] transition-all duration-700 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/20">
            or
          </span>
          <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
        </div>

        {/* GOOGLE LOGIN */}
        <a
          href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
          className="w-full flex items-center justify-center gap-3 py-4 border border-[#c8a97e]/20 text-white/60 text-[11px] tracking-[0.3em] uppercase hover:border-[#c8a97e]/50 hover:text-white transition-all duration-500"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        {/* SIGNUP */}
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-white/40 mt-8">
          Don't have an account?{" "}
          <Link
            className="text-[#c8a97e] hover:text-white transition-colors duration-500 ml-1 border-b border-[#c8a97e]/40"
            to="/register"
          >
            signup
          </Link>
        </p>

      </div>
    </div>
  );
}