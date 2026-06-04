import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import axiosInstance from "../../../api/apiInstance";
export const Navbar = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [query, setQuery] = useState("");

 useEffect(() => {
  const checkAuth = async () => {
    try {
      await axiosInstance.get("/auth/me", {
        withCredentials: true,
      });
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  checkAuth();
  window.addEventListener("userLoggedOut", checkAuth);
  window.addEventListener("userLoggedIn", checkAuth);

  return () => {
    window.removeEventListener("userLoggedOut", checkAuth);
    window.removeEventListener("userLoggedIn", checkAuth);
  };
}, []);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:3001/api/auth/logout",
      {},
      { withCredentials: true } // ✅ clears the cookie on server
    );
  } catch (err) {
    console.error("Logout error:", err);
  }

  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  window.dispatchEvent(new Event("userLoggedOut"));
  setIsAuthenticated(false);
  setMobileMenuOpen(false);
  navigate("/login");
};

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-[#100c09] backdrop-blur-md border-b border-[#c8a97e]/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">

        <h2
          onClick={() => handleNavigate("/")}
          className="text-xl md:text-5xl font-semibold cursor-pointer text-[#e6c89c] hover:text-white transition-all duration-500"
        >
          Luxora
        </h2>

        <div className="hidden md:flex items-center gap-10">
          {[
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: "Wishlist", path: "/wishlist" },
            { name: "Cart", path: "/cart" },
          ].map((item) => (
            <div
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className="relative cursor-pointer text-[#e6c89c]/70 hover:text-[#f5deb3] tracking-[0.3em] uppercase font-light transition-all duration-300 group"
            >
              {item.name}
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#c8a97e] transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center relative group">
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#0f0a07] border border-[#c8a97e]/30 text-[#e6c89c] placeholder-[#c8a97e]/40 pl-4 pr-10 py-2 rounded-full outline-none w-56 focus:w-72 focus:border-[#c8a97e] transition-all duration-500 ease-in-out text-sm"
          />
          <button
            type="submit"
            className="absolute right-3 p-1 text-[#c8a97e] hover:text-[#f5deb3] transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 transition-transform duration-300 active:scale-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </form>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => handleNavigate("/profile")}
              className="p-2 rounded-full border border-[#c8a97e]/30 hover:bg-[#c8a97e]/10 transition-all"
              title="Edit Profile"
            >
              ✏️
            </button>
          )}

          {isAuthenticated ? (
            <div
              onClick={handleLogout}
              className="px-8 py-2 rounded-full border border-[#c8a97e]/40 text-[#c8a97e] text-[10px] tracking-[0.2em] uppercase font-bold cursor-pointer hover:bg-[#c8a97e] hover:text-[#0f0a07] transition-all duration-500 active:scale-95"
            >
              Logout
            </div>
          ) : (
            <div
              onClick={() => handleNavigate("/login")}
              className="px-8 py-2 rounded-full border border-[#c8a97e]/40 text-[#e6c89c] text-[10px] tracking-[0.2em] uppercase font-bold cursor-pointer hover:bg-[#c8a97e] hover:text-[#0f0a07] transition-all duration-500 active:scale-95"
            >
              Login
            </div>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`w-6 h-[2px] bg-[#e6c89c] transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`w-6 h-[2px] bg-[#e6c89c] transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-[2px] bg-[#e6c89c] transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-500 ${mobileMenuOpen ? "max-h-[450px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 flex flex-col gap-6 bg-[#100c09] border-t border-[#c8a97e]/10">

          <form onSubmit={handleSearch} className="mt-2">
            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#0f0a07] border border-[#c8a97e]/30 text-[#e6c89c] px-4 py-2 rounded-full outline-none"
            />
          </form>

          {[
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: "Cart", path: "/cart" },
            { name: "Wishlist", path: "/wishlist" },
          ].map((item) => (
            <div
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className="cursor-pointer text-[#e6c89c]/80 hover:text-[#f5deb3] tracking-[0.25em] uppercase text-sm transition"
            >
              {item.name}
            </div>
          ))}

          {isAuthenticated ? (
            <div
              onClick={handleLogout}
              className="mt-4 px-6 py-3 rounded-full border border-[#c8a97e]/40 text-[#c8a97e] text-[11px] tracking-[0.2em] uppercase font-bold cursor-pointer hover:bg-[#c8a97e] hover:text-[#0f0a07] transition-all duration-500 text-center"
            >
              Logout
            </div>
          ) : (
            <div
              onClick={() => handleNavigate("/login")}
              className="mt-4 px-6 py-3 rounded-full border border-[#c8a97e]/40 text-[#c8a97e] text-[11px] tracking-[0.2em] uppercase font-bold cursor-pointer hover:bg-[#c8a97e] hover:text-[#0f0a07] transition-all duration-500 text-center"
            >
              Login
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};