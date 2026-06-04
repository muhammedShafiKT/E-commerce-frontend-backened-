import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const adminRegisterSchema = yup.object({
  name: yup.string().trim().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm your password"),
  adminKey: yup.string().required("Admin secret key is required"),
});

export default function AdminRegister() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(adminRegisterSchema),
    mode: "onBlur",
  });

  const userdetailsadd = async (data) => {
    try {
      await axios.post("http://localhost:3001/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        adminKey: data.adminKey,
        role: "admin",
      });
      toast.success("Admin account created");
      reset();
      navigate("/admin/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server error. Try again.");
    }
  };

  return (
    
    <div className="min-h-screen bg-[#0f0a07] px-4 py-10">
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-[#1a140e]/60 backdrop-blur-2xl border border-[#c8a97e]/20 shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-10 relative mt-6">

          {/* Admin badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 bg-[#7c1a1a] border border-[#c8a97e]/30 px-4 py-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e6c89c] animate-pulse" />
              <span className="text-[9px] tracking-[0.35em] uppercase text-[#e6c89c] font-bold">
                Admin Registration
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10 mt-4">
            <h2 className="text-2xl font-serif tracking-[0.15em] text-[#e6c89c] uppercase italic">
              Create Admin
            </h2>
            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-4">
              Restricted access — authorised personnel only
            </p>
            <div className="h-[1px] w-16 bg-[#c8a97e]/30 mx-auto mt-6" />
          </div>

          {/* ✅ FIX: Connected onSubmit + all inputs wired to register() */}
          <form onSubmit={handleSubmit(userdetailsadd)} className="space-y-6">

            {/* NAME */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70">Name</label>
              <input
                {...register("name")}
                className="w-full mt-1 px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none text-sm"
              />
              {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name.message}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70">Email</label>
              <input
                {...register("email")}
                className="w-full mt-1 px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none text-sm"
              />
              {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full mt-1 px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none text-sm"
              />
              {errors.password && <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full mt-1 px-0 py-2 bg-transparent text-white border-b border-[#c8a97e]/20 focus:border-[#f5deb3] outline-none text-sm"
              />
              {errors.confirmPassword && <p className="text-red-400 text-[10px] mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* ADMIN KEY */}
            <div className="pt-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/70">Admin Secret Key</label>
              <input
                {...register("adminKey")}
                type="password"
                className="w-full mt-1 px-0 py-2 bg-transparent text-[#e6c89c] border-b border-[#7c1a1a]/60 focus:border-[#c8a97e] outline-none text-sm"
              />
              {errors.adminKey && <p className="text-red-400 text-[10px] mt-1">{errors.adminKey.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 py-4 bg-[#7c1a1a] text-[#e6c89c] text-[11px] tracking-[0.4em] uppercase font-bold hover:bg-[#9b2222] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Admin Account"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}