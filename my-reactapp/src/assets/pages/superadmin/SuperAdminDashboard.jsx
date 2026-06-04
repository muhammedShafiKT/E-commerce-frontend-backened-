// pages/superadmin/SuperAdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../../api/apiInstance";

const schema = yup.object({
  name: yup.string().trim().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), mode: "onBlur" });

  const fetchAdmins = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/admins");
      setAdmins(data);
    } catch {
      toast.error("Failed to fetch admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async (data) => {
    try {
      await axiosInstance.post("/admin/create-admin", data);
      toast.success("Admin created — credentials sent by email");
      reset();
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    }
  };

  const toggleBlock = async (id, status) => {
    try {
      const { data } = await axiosInstance.patch(`/admin/admins/${id}/block`, {});
      toast.success(`Admin ${data.status}`);
      fetchAdmins();
    } catch {
      toast.error("Action failed");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await axiosInstance.delete(`/admin/admins/${id}`);
      toast.success("Admin deleted");
      fetchAdmins();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      navigate("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0a07] text-white selection:bg-[#7c1a1a] selection:text-[#e6c89c]">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#c8a97e]/10 bg-[#16110c]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif text-[#e6c89c] tracking-[0.2em] uppercase italic">
              Super <span className="font-sans font-light opacity-60 text-sm ml-2">Admin Portal</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="group relative px-6 py-2 overflow-hidden border border-[#c8a97e]/30 transition-all duration-500 hover:border-[#7c1a1a]"
          >
            <span className="relative z-10 text-[#c8a97e] group-hover:text-[#e6c89c] text-[10px] tracking-[0.3em] uppercase">
              Logout
            </span>
            <div className="absolute inset-0 bg-[#7c1a1a] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-[#1a140e] border border-[#c8a97e]/10 p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-[12px] tracking-[0.4em] text-[#e6c89c] uppercase font-bold">
                  Register Admin
                </h2>
                <div className="h-[1px] w-12 bg-[#7c1a1a] mt-2"></div>
              </div>

              <form onSubmit={handleSubmit(createAdmin)} className="space-y-6">
                <div className="group">
                  <label className="block text-[9px] uppercase tracking-[0.3em] text-[#c8a97e]/50 mb-1 group-focus-within:text-[#e6c89c] transition-colors">
                    Full Name
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Enter name"
                    className="w-full bg-[#130d09] border border-[#c8a97e]/10 px-4 py-3 text-sm focus:border-[#7c1a1a] outline-none transition-all placeholder:text-white/10"
                  />
                  {errors.name && (
                    <p className="text-[#ff5f5f] text-[9px] mt-2 tracking-widest uppercase">{errors.name.message}</p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-[9px] uppercase tracking-[0.3em] text-[#c8a97e]/50 mb-1 group-focus-within:text-[#e6c89c] transition-colors">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    placeholder="admin@example.com"
                    className="w-full bg-[#130d09] border border-[#c8a97e]/10 px-4 py-3 text-sm focus:border-[#7c1a1a] outline-none transition-all placeholder:text-white/10"
                  />
                  {errors.email && (
                    <p className="text-[#ff5f5f] text-[9px] mt-2 tracking-widest uppercase">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#7c1a1a] text-[#e6c89c] text-[10px] tracking-[0.5em] uppercase font-bold hover:brightness-125 transition-all disabled:opacity-50 active:scale-95 shadow-lg"
                >
                  {isSubmitting ? "Processing..." : "Authorize Access"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a140e]/40 border border-[#c8a97e]/10 backdrop-blur-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-[#c8a97e]/10 flex justify-between items-center">
                <h2 className="text-[12px] tracking-[0.4em] text-[#c8a97e] uppercase">
                  Existing Administrators
                </h2>
                <span className="text-[10px] text-white/40 tracking-tighter italic">
                  Total: {admins.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#130d09]/50 text-[#c8a97e]/40 text-[9px] tracking-[0.3em] uppercase">
                      <th className="px-8 py-5 font-medium">Administrator</th>
                      <th className="px-8 py-5 font-medium">Access Status</th>
                      <th className="px-8 py-5 font-medium">Joined On</th>
                      <th className="px-8 py-5 font-medium text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c8a97e]/5">
                    {admins.map((a) => (
                      <tr key={a._id} className="group hover:bg-[#c8a97e]/[0.02] transition-colors">
                        <td className="px-8 py-5">
                          <div className="text-sm text-white/90 font-medium">{a.name}</div>
                          <div className="text-[11px] text-white/30 lowercase">{a.email}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center gap-2 text-[9px] px-3 py-1 uppercase tracking-[0.2em] rounded-full ${
                              a.status === "blocked"
                                ? "bg-red-950/30 text-red-400 border border-red-900/50"
                                : "bg-emerald-950/30 text-emerald-400 border border-emerald-900/50"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full animate-pulse ${a.status === "blocked" ? "bg-red-400" : "bg-emerald-400"}`} />
                            {a.status || "active"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs text-white/40 tabular-nums">
                          {new Date(a.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-6">
                            <button
                              onClick={() => toggleBlock(a._id, a.status)}
                              className="text-[9px] tracking-widest uppercase text-[#c8a97e] hover:text-white transition-colors underline underline-offset-4 decoration-[#c8a97e]/20"
                            >
                              {a.status === "blocked" ? "Unrestrict" : "Restrict"}
                            </button>
                            <button
                              onClick={() => deleteAdmin(a._id)}
                              className="text-[9px] tracking-widest uppercase text-red-500/70 hover:text-red-400 transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {admins.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-[#c8a97e]/20 text-[10px] tracking-[0.5em] uppercase italic">
                      No active administrators found in database
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}