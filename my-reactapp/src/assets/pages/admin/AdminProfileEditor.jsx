import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axiosInstance from "../../../api/apiInstance";

export const AdminProfileEditor = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axiosInstance
      .get("/auth/me")
      .then((res) => {
        // Non-admins cannot access this page
        if (res.data.role !== "admin") {
          navigate("/", { replace: true });
          return;
        }
        setAdminId(res.data.id);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Session expired. Please login again.");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.currentPassword) newErrors.currentPassword = "Current password is required";
    if (form.newPassword.length < 8) newErrors.newPassword = "Minimum 8 characters required";
    if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      await axiosInstance.patch(
        `/users/admin/${adminId}/change-password`,
        { currentPassword: form.currentPassword, newPassword: form.newPassword }
      );

      toast.success("Password updated", {
        style: {
          background: "#0f0a07",
          color: "#c8a97e",
          border: "1px solid rgba(200, 169, 126, 0.2)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        },
      });

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      toast.error(message, {
        style: {
          background: "#0f0a07",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          fontSize: "10px",
          letterSpacing: "0.2em",
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0705] flex items-center justify-center">
        <p className="text-[#c8a97e]/40 text-[10px] uppercase tracking-[0.4em] animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0705] py-16 px-6">
      <Toaster position="bottom-center" />

      <div className="w-full max-w-[450px] mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[#c8a97e]/40 text-[9px] uppercase tracking-[0.4em] mb-3">
            Luxora
          </p>
          <h2 className="text-white text-2xl font-serif italic tracking-wider">
            Admin Settings
          </h2>
          <div className="w-12 h-[1px] bg-[#c8a97e]/30 mx-auto mt-4" />
        </div>

        <div className="bg-[#0f0a07] border border-[#c8a97e]/10 p-10 md:p-14">
          <div className="space-y-10">

            {/* Section label */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                Change Password
              </span>
              <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
            </div>

            {/* Current Password */}
            <div className="relative">
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#c8a97e]/20 py-3 text-white text-sm outline-none focus:border-[#c8a97e] transition-colors duration-500 peer"
                placeholder=" "
              />
              <label className="absolute left-0 top-3 text-[#c8a97e]/40 text-[9px] uppercase tracking-[0.3em] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-[#c8a97e] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[8px]">
                Current Password
              </label>
              {errors.currentPassword && (
                <p className="text-rose-800 text-[9px] uppercase mt-2 tracking-widest">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#c8a97e]/20 py-3 text-white text-sm outline-none focus:border-[#c8a97e] transition-colors duration-500 peer"
                placeholder=" "
              />
              <label className="absolute left-0 top-3 text-[#c8a97e]/40 text-[9px] uppercase tracking-[0.3em] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-[#c8a97e] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[8px]">
                New Password
              </label>
              {errors.newPassword && (
                <p className="text-rose-800 text-[9px] uppercase mt-2 tracking-widest">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#c8a97e]/20 py-3 text-white text-sm outline-none focus:border-[#c8a97e] transition-colors duration-500 peer"
                placeholder=" "
              />
              <label className="absolute left-0 top-3 text-[#c8a97e]/40 text-[9px] uppercase tracking-[0.3em] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-[#c8a97e] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[8px]">
                Confirm New Password
              </label>
              {errors.confirmPassword && (
                <p className="text-rose-800 text-[9px] uppercase mt-2 tracking-widest">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-4 space-y-4">
              <button
                onClick={handleUpdate}
                className="w-full py-4 bg-[#c8a97e] text-black text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#f5deb3] transition-all duration-700 shadow-xl active:scale-95"
              >
                Update Password
              </button>

              <button
                onClick={() => navigate("/admin")}
                className="w-full py-3 text-[#c8a97e]/30 text-[9px] uppercase tracking-[0.3em] hover:text-[#c8a97e]/60 transition-colors duration-500 border border-[#c8a97e]/10 hover:border-[#c8a97e]/20"
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>

        <p className="text-center text-[8px] uppercase tracking-[0.3em] text-white/10 mt-8">
          Admin access only
        </p>

      </div>
    </div>
  );
};