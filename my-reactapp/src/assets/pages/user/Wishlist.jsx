import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "./Cartprovider.jsx";
import { Navbar } from "./Navbar.jsx";
import { useWishlist } from "./Wishlistprovider.jsx";
import "../../../index.css";

const Wishlist = () => {
  const { wishlist, removeItemFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  /* ========== EMPTY STATE AFTER LOADING ========== */
  if (!loading && (!Array.isArray(wishlist) || wishlist.length === 0)) {
    return (
      <div className="min-h-screen bg-[#0f0a07]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-[#c8a97e] font-serif italic text-2xl tracking-widest opacity-40 uppercase">
            Your Wishlist is Empty
          </h2>
          <div className="h-[1px] w-12 bg-[#c8a97e]/20 mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a07]">
      <Navbar />

      <div className="text-white px-6 py-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] tracking-[0.5em] text-[#c8a97e] uppercase mb-2">
              Saved Pieces
            </p>
            <h1 className="text-4xl font-serif italic tracking-wider text-white">
              Your Wishlist
            </h1>
            <div className="h-[1px] w-20 bg-[#c8a97e] mt-4 opacity-50"></div>
          </div>

          {/* ========== SHIMMER SKELETON ========== */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-6 bg-[#1a140e]/30 border border-[#c8a97e]/10 p-4"
                >
                  <div className="shimmer w-32 h-40 shrink-0 rounded-sm" />
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                    <div className="space-y-3">
                      <div className="shimmer block h-5 w-3/4 rounded" />
                      <div className="shimmer block h-5 w-1/3 rounded" />
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="shimmer block h-8 w-32 rounded" />
                      <div className="shimmer block h-4 w-20 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== REAL WISHLIST GRID ========== */}
          {!loading && wishlist.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {wishlist.map((item) => (
                <div
                  className="flex gap-6 bg-[#1a140e]/30 border border-[#c8a97e]/10 p-4 transition-all duration-500 hover:border-[#c8a97e]/40 group"
                  key={item.productId}
                >
                  <div className="w-32 h-40 bg-[#120d0a] overflow-hidden shrink-0">
                    <img
                      src={
                        Array.isArray(item.images)
                          ? item.images[0]
                          : item.images
                      }
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <h3 className="text-xl font-serif italic tracking-wide text-white/90">
                        {item.description}
                      </h3>
                      <p className="text-[#e6c89c] text-lg mt-2 font-light">
                        ₹ {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <button
                        className="bg-[#c8a97e] text-[#1a140e] text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-2 transition-all duration-500 hover:bg-[#f5deb3] active:scale-95"
                      onClick={() => {
  addToCart({
    id: String(item.productId),        // ← the REAL product id
    _id: String(item.productId),       // ← also set _id to match
    description: item.description,
    price: item.price,
    images: Array.isArray(item.images) ? item.images : [item.images],
  });
  toast.success("Added to Cart Successfully");
}}
                      >
                        Add to Cart
                      </button>

                      <button
                        className="text-[10px] uppercase tracking-widest text-white/30 hover:text-rose-500 transition-colors border-b border-transparent hover:border-rose-500/50 pb-1"
                        onClick={() => removeItemFromWishlist(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;