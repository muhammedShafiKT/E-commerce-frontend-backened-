import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../api/apiInstance";

export default function AdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Products", path: "products", icon: "📦" },
    { name: "Orders", path: "orders", icon: "🛒" },
    { name: "Users", path: "users", icon: "👥" },
    { name: "coupons", path: "coupons", icon: "💳" },
    { name: "offers", path: "offers", icon: "🏷️" }
  ];

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    window.dispatchEvent(new Event("userLoggedOut"));
    setIsMobileMenuOpen(false);
    nav("/login");
  };

  const navigateTo = (path) => {
    nav(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0f0a07] text-[#e6c89c] overflow-hidden">

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0705] border-r border-[#c8a97e]/10 p-8
        transition-transform duration-300 ease-in-out flex flex-col justify-between
        lg:translate-x-0 lg:static lg:h-full
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          <div className="mb-12 flex justify-between items-center">
            <h1 className="text-2xl font-serif italic text-[#c8a97e] tracking-tighter">
              Luxora <span className="text-[10px] block uppercase tracking-[0.3em] font-sans not-italic opacity-50">Admin Suite</span>
            </h1>
            <button className="lg:hidden text-2xl" onClick={() => setIsMobileMenuOpen(false)}>×</button>
          </div>

          <nav className="space-y-6">
            {menuItems.map((item) => (
              <div
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`flex items-center gap-4 cursor-pointer text-xs uppercase tracking-[0.2em] transition-all duration-300 group
                  ${isActive(item.path) ? "text-white" : "text-[#c8a97e]/40 hover:text-[#e6c89c]"}`}
              >
                <span className={`transition-transform duration-300 group-hover:scale-125 ${isActive(item.path) ? "scale-110" : "opacity-50"}`}>
                  {item.icon}
                </span>
                {item.name}
                {isActive(item.path) && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-[#c8a97e] shadow-[0_0_8px_#c8a97e]"></div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-rose-900/60 hover:text-rose-700 transition-colors pt-8 border-t border-[#c8a97e]/5"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex justify-between items-center p-6 lg:p-12 border-b border-[#c8a97e]/5 lg:border-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-[#c8a97e] text-2xl"
            >
              ☰
            </button>
            <h2 className="text-xl lg:text-3xl font-serif italic tracking-wide truncate">
              {menuItems.find(i => isActive(i.path))?.name || "Suite"}
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-widest opacity-40">
            <span>System Status:</span>
            <span className="text-emerald-500 font-bold">● Active</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 lg:pt-0">
          <div className="bg-[#1a140e]/30 border border-[#c8a97e]/5 rounded-sm p-4 lg:p-8 min-h-[70vh] backdrop-blur-sm">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}