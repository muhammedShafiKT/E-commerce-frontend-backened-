import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0a0705] border-t border-[#c8a97e]/10 pt-24 pb-12 px-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
 
          <div className="flex flex-col gap-4">
            <h2 
              onClick={() => goTo("/")}
              className="text-4xl font-serif italic text-[#e6c89c] cursor-pointer"
            >
              Luxora
            </h2>
            <p className="text-[#c8a97e]/40 text-[10px] tracking-[0.4em] uppercase">
              Timeless Interiors
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:gap-20 gap-x-12 gap-y-8">

            <div className="flex flex-col gap-3">
              <button onClick={() => goTo("/")} className="text-white/40 hover:text-[#e6c89c] text-xs text-left transition-colors uppercase tracking-widest">Home</button>
              <button onClick={() => goTo("/products")} className="text-white/40 hover:text-[#e6c89c] text-xs text-left transition-colors uppercase tracking-widest">Curation</button>
              <button onClick={() => goTo("/cart")} className="text-white/40 hover:text-[#e6c89c] text-xs text-left transition-colors uppercase tracking-widest">Cart</button>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => goTo("/wishlist")} className="text-white/40 hover:text-[#e6c89c] text-xs text-left transition-colors uppercase tracking-widest">Wishlist</button>
              <button onClick={() => goTo("/")} className="text-white/40 hover:text-[#e6c89c] text-xs text-left transition-colors uppercase tracking-widest">Support</button>
              <button onClick={() => goTo("/")} className="text-white/40 hover:text-[#e6c89c] text-xs text-left transition-colors uppercase tracking-widest">Care Guide</button>
            </div>

            <div className="flex flex-col gap-3">
              <a href="#" className="text-white/40 hover:text-[#e6c89c] text-xs transition-colors uppercase tracking-widest">Instagram</a>
              <a href="#" className="text-white/40 hover:text-[#e6c89c] text-xs transition-colors uppercase tracking-widest">Pinterest</a>
             
            </div>

          </div>

          <div className="text-left md:text-right flex flex-col gap-2">
            <p className="text-white/60 text-xs tracking-widest">concierge@luxora.com</p>
            <p className="text-white/20 text-[10px] uppercase tracking-widest">Mumbai, India</p>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-[#c8a97e]/5">
          <p className="text-[9px] text-white/10 tracking-[0.3em] uppercase">
            © 2026 Luxora Interiors • All Rights Reserved
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] text-white/10 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="text-[9px] text-white/10 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Terms of Service</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;