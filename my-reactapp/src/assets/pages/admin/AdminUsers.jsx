import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/apiInstance";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axiosInstance.get("/users");
        setUsers(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId, currentStatus) => {
    const status = currentStatus || "active";
    const newStatus = status === "active" ? "blocked" : "active";
    try {
      await axiosInstance.patch(`/users/${userId}/status`, { status: newStatus });
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, status: newStatus } : u))
      );
      toast.success(`User ${newStatus === "active" ? "unblocked" : "blocked"}`);
    } catch {
      toast.error("Failed to update user status.");
    }
  };

const deleteUser = async (userId) => {
  if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
  try {
    await axiosInstance.delete(`/users/${userId}`);
    setUsers(prev => prev.filter(u => u._id !== userId));
    toast.success("User deleted.");
  } catch {
    toast.error("Failed to delete user.");
  }
};

  if (loading) return <div className="p-12 text-[#c8a97e] animate-pulse uppercase tracking-[0.3em] text-xs">Accessing Patron Records...</div>;
  if (error) return <h2 className="text-red-400 p-12">Error: {error}</h2>;

  return (
    <div className="space-y-8 text-[#e6c89c]">
      <div className="border-b border-[#c8a97e]/10 pb-4">
        <h2 className="text-2xl tracking-widest uppercase font-serif italic">User Management</h2>
        <p className="text-[10px] text-[#c8a97e]/50 uppercase tracking-[0.3em] mt-1">Global Member Registry</p>
      </div>

      {/* Desktop */}
      <div className="hidden md:block border border-[#c8a97e]/10 bg-[#1a140e]/40 rounded-sm">
        <table className="w-full text-left text-xs tracking-wider uppercase">
          <thead>
            <tr className="border-b border-[#c8a97e]/20 text-[#c8a97e]/60">
              <th className="p-4 font-light">Member ID</th>
              <th className="p-4 font-light">Identity</th>
              <th className="p-4 font-light">Role</th>
              <th className="p-4 font-light">Status</th>
              <th className="p-4 font-light text-right">Access Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c8a97e]/5">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-[#c8a97e]/5 transition-colors">
                <td className="p-4 font-mono text-[10px] opacity-40">#{user._id.slice(-6)}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-white normal-case font-serif italic text-sm">{user.name}</span>
                    <span className="text-[9px] lowercase tracking-normal opacity-40">{user.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${user.role === "admin" ? "bg-[#c8a97e]/20 text-[#c8a97e]" : "bg-white/5 text-white/40"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={user.status === "active" ? "text-emerald-500" : "text-rose-500"}>
                    ● {user.status || "active"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.role !== "admin" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.status)}
                        className={`px-3 py-1 border transition-all duration-300 ${
                          user.status === "active"
                            ? "border-rose-900/30 text-rose-400 hover:bg-rose-900 hover:text-white"
                            : "border-emerald-900/30 text-emerald-400 hover:bg-emerald-900 hover:text-white"
                        }`}
                      >
                        {user.status === "active" ? "Revoke Access" : "Grant Access"}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="px-3 py-1 border border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-[9px] opacity-20 italic">Protected Account</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {users.map(user => (
          <div key={user._id} className="border border-[#c8a97e]/10 bg-[#1a140e]/40 p-5 rounded-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-serif italic text-lg">{user.name}</h4>
                <p className="text-[10px] opacity-40 lowercase tracking-tight">{user.email}</p>
              </div>
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 border ${
                user.status === "active"
                  ? "border-emerald-500/20 text-emerald-500"
                  : "border-rose-500/20 text-rose-500"
              }`}>
                {user.status || "active"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#c8a97e]/5">
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-40">Role: {user.role}</span>
              {user.role !== "admin" ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => toggleUserStatus(user._id, user.status)}
                    className={`text-[10px] uppercase tracking-widest font-bold underline underline-offset-4 ${
                      user.status === "active" ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {user.status === "active" ? "Block" : "Unblock"}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-[10px] uppercase tracking-widest font-bold underline underline-offset-4 text-red-400"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <span className="text-[9px] opacity-20 italic">Protected</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-20 opacity-30 text-[10px] uppercase tracking-[0.5em]">
          No patrons found in registry
        </div>
      )}
    </div>
  );
}