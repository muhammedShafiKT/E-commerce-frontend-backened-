import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast, Toaster } from "react-hot-toast";
import axiosInstance from "../../../api/apiInstance";

export const ProfileEditor = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axiosInstance
      .get("/auth/me")
      .then((res) => {
        if (res.data.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }
        setUserId(res.data.id);
        setIsGoogleUser(res.data.isGoogleUser || false);
        setForm((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        toast.error("Session expired. Please login again.");
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";

    if (changingPassword) {
      if (!form.currentPassword)
        newErrors.currentPassword = "Current password is required";
      if (form.newPassword.length < 6)
        newErrors.newPassword = "Minimum 8 characters required";
      if (form.newPassword !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    if (!userId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const payload = {
      name: form.name,
      ...(changingPassword && {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    };

    try {
      await axiosInstance.patch(`/users/${userId}`, payload);

      toast.success("Profile updated", {
        style: {
          background: "#0f0a07",
          color: "#c8a97e",
          border: "1px solid rgba(200, 169, 126, 0.2)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        },
      });

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setChangingPassword(false);
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
            Account Settings
          </h2>
          <div className="w-12 h-[1px] bg-[#c8a97e]/30 mx-auto mt-4" />
        </div>

        <div className="bg-[#0f0a07] border border-[#c8a97e]/10 p-10 md:p-14">
          <div className="space-y-10">

            {/* Name */}
            <div className="relative">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#c8a97e]/20 py-3 text-white text-sm outline-none focus:border-[#c8a97e] transition-colors duration-500 peer"
                placeholder=" "
              />
              <label className="absolute left-0 top-3 text-[#c8a97e]/40 text-[9px] uppercase tracking-[0.3em] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-[#c8a97e] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[8px]">
                Full Name
              </label>
              {errors.name && (
                <p className="text-rose-800 text-[9px] uppercase mt-2 tracking-widest">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email — read only */}
            <div className="relative">
              <input
                name="email"
                value={form.email}
                disabled
                className="w-full bg-transparent border-b border-[#c8a97e]/10 py-3 text-white/30 text-sm outline-none cursor-not-allowed peer"
                placeholder=" "
              />
              <label className="absolute left-0 -top-4 text-[8px] text-[#c8a97e]/30 uppercase tracking-[0.3em] pointer-events-none">
                Email — cannot be changed
              </label>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                Security
              </span>
              <div className="flex-1 h-[1px] bg-[#c8a97e]/10" />
            </div>

            {isGoogleUser ? (
              <div className="border border-[#c8a97e]/10 px-5 py-4 flex items-start gap-3">
                <span className="text-[#c8a97e]/40 mt-[2px]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[#c8a97e]/60 text-[9px] uppercase tracking-[0.3em]">
                    Signed in with Google
                  </p>
                  <p className="text-white/20 text-[9px] tracking-wider mt-1 leading-relaxed">
                    Password management is handled by Google. You cannot set or change a password for this account.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setChangingPassword(!changingPassword);
                    setForm((prev) => ({
                      ...prev,
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    }));
                    setErrors({});
                  }}
                  className="text-[#c8a97e]/40 text-[9px] uppercase tracking-[0.3em] hover:text-[#c8a97e] transition-colors duration-500 border-b border-[#c8a97e]/10 pb-1"
                >
                  {changingPassword ? "— Cancel" : "+ Change Password"}
                </button>

                {changingPassword && (
                  <div className="space-y-10">
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
                  </div>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="pt-4 space-y-4">
              <button
                onClick={handleUpdate}
                className="w-full py-4 bg-[#c8a97e] text-black text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#f5deb3] transition-all duration-700 shadow-xl active:scale-95"
              >
                Save Changes
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full py-3 text-[#c8a97e]/30 text-[9px] uppercase tracking-[0.3em] hover:text-[#c8a97e]/60 transition-colors duration-500 border border-[#c8a97e]/10 hover:border-[#c8a97e]/20"
              >
                Go Back
              </button>
            </div>

          </div>
        </div>

        <p className="text-center text-[8px] uppercase tracking-[0.3em] text-white/10 mt-8">
          Changes are saved immediately
        </p>

      </div>
    </div>
  );
};