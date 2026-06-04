import axiosInstance from "../../../api/apiInstance";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "./Cartprovider";
import { Navbar } from "./Navbar";
import toast from "react-hot-toast";
import { useWishlist } from "./Wishlistprovider";

function ProductUI() {
  const { addToCart }     = useCart();
  const { addToWishlist } = useWishlist();
  const { id }            = useParams();
  const navigate          = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`products/${id}`, { withCredentials: true })
      .then((res) => {
        console.log("product data:", res.data); // debug: verify offer is present
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0a07] flex items-center justify-center">
        <p className="text-[#c8a97e] text-[10px] tracking-[0.5em] uppercase animate-pulse">
          Loading Masterpiece…
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f0a07] flex items-center justify-center text-center">
        <div>
          <p className="text-[#c8a97e] text-[10px] tracking-[0.4em] uppercase mb-4">Error</p>
          <h2 className="text-white font-serif italic text-2xl">Product not found</h2>
        </div>
      </div>
    );
  }

  const imageSrc    = Array.isArray(product.images) ? product.images[0] : product.images;
  const offer       = product.offer;
  const isFlash     = offer?.type === "flash";
  const isBogo      = offer?.type === "bogo";
  const hasOffer    = !!offer;                    // FIX: was `offer && product.savings > 0` — broke BOGO
  const hasSavings  = hasOffer && product.savings > 0;
  const displayPrice = product.finalPrice ?? product.price;

  const normalizedProduct = {
    ...product,
    id:         product._id || product.id,
    price:      product.price,      // FIX: keep original price, not finalPrice
    finalPrice: displayPrice,
  };

  return (
    <div className="min-h-screen bg-[#0f0a07]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 pb-20">
        <div className="bg-[#1a140e]/40 backdrop-blur-3xl border border-[#c8a97e]/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:grid md:grid-cols-2">

          {/* IMAGE */}
          <div className="relative bg-[#120d0a] flex items-center justify-center overflow-hidden group min-h-[320px] md:min-h-[560px]">

            {/* Non-bogo offer badge */}
            {hasOffer && !isBogo && (
              <div
                className="absolute top-4 left-4 z-10 px-3 py-2 flex flex-col gap-0.5"
                style={{
                  background:     isFlash ? "rgba(220,38,38,0.90)" : "rgba(200,169,126,0.92)",
                  border:         `1px solid ${isFlash ? "#f87171" : "#e6c89c"}`,
                  color:          isFlash ? "#fff" : "#1a140e",
                  backdropFilter: "blur(6px)",
                }}
              >
                {offer.title && (
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.4em]">
                    {isFlash ? "⚡ " : ""}{offer.title}
                  </span>
                )}
                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
                  {offer.discountPercent}% Off
                </span>
              </div>
            )}

            {/* BOGO badge */}
            {isBogo && (
              <div
                className="absolute top-4 left-4 z-10 px-3 py-2 flex flex-col gap-0.5"
                style={{
                  background:     "rgba(5,150,105,0.90)",
                  border:         "1px solid #34d399",
                  color:          "#fff",
                  backdropFilter: "blur(6px)",
                }}
              >
                {offer.name && (
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.4em]">
                    {offer.name}
                  </span>
                )}
                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
                  B{offer.bogoConfig?.buyQty} G{offer.bogoConfig?.getFree}
                </span>
              </div>
            )}

            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover md:object-contain md:p-12 transition-transform duration-1000 group-hover:scale-105"
              style={{ minHeight: "320px", maxHeight: "560px" }}
              onError={(e) => { e.target.src = "/placeholder.png"; }}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] pointer-events-none" />
          </div>

          {/* DETAILS */}
          <div className="p-8 md:p-16 flex flex-col justify-center">

            <div className="mb-6 md:mb-8">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[#c8a97e] mb-3">
                {product.brand || "Exclusive Collection"}
              </p>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-wider leading-tight italic">
                {product.name}
              </h1>
              <div className="h-[1px] w-20 bg-[#c8a97e]/40 mt-6" />
            </div>

            {/* PRICE */}
            <div className="mb-6 md:mb-8">
              {hasSavings && (
                <p className="text-base text-white/30 line-through tracking-tight mb-1">
                  ₹{product.price?.toLocaleString()}
                </p>
              )}
              <p className="text-2xl md:text-3xl font-light text-[#e6c89c] tracking-tighter">
                ₹{displayPrice?.toLocaleString()}
              </p>

              {/* Discount offer savings line */}
              {hasSavings && (
                <div className="mt-2 flex flex-col gap-1">
                  {offer.name && (
                    <p className="text-[10px] text-[#c8a97e] tracking-widest uppercase font-bold">
                      {isFlash ? "⚡ " : ""}{offer.name}
                    </p>
                  )}
                  <p className="text-[10px] text-green-400 tracking-widest uppercase">
                    {offer.discountPercent}% off · You save ₹{product.savings?.toLocaleString()}
                  </p>
                </div>
              )}

              {/* BOGO info line */}
              {isBogo && (
                <p className="text-[10px] text-emerald-400 tracking-widest uppercase mt-2">
                  {offer.name
                    ? `${offer.name} · `
                    : ""}
                  Buy {offer.bogoConfig?.buyQty} Get {offer.bogoConfig?.getFree} Free
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-white/60 text-sm leading-[1.8] font-light tracking-wide">
              {product.description}
            </p>

            {/* BUTTONS */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={async () => {
                  try {
                    await addToCart(normalizedProduct);
                    toast.success("Item added to cart");
                  } catch (err) {
                    if (err?.response?.status === 401) {
                      toast.error("Please login first");
                      navigate("/login");
                    } else {
                      toast.error("Failed to add to cart");
                    }
                  }
                }}
                className="flex-1 bg-[#c8a97e] hover:bg-[#f5deb3] text-[#1a140e] py-4 text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-xl active:scale-95"
              >
                Add to Cart
              </button>

              <button
                onClick={() => navigate("/detailsandpayment", { state: { buyNowProduct: normalizedProduct } })}
                className="flex-1 border border-[#c8a97e]/40 hover:border-[#c8a97e] text-[#c8a97e] hover:text-white py-4 text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* WISHLIST */}
            <button
              onClick={async () => {
                try {
                  const res = await addToWishlist(product);
                  if (res?.success) {
                    toast.success("Added to wishlist");
                  } else {
                    toast.error(res?.message || "Failed");
                  }
                } catch (err) {
                  if (err?.response?.status === 401) {
                    toast.error("Please login first");
                    navigate("/login");
                  } else {
                    toast.error("Failed to add to wishlist");
                  }
                }
              }}
              className="mt-6 text-[10px] uppercase tracking-widest text-[#c8a97e] hover:text-white transition-colors"
            >
              Add to Wishlist
            </button>

            <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-white/20 text-center">
              Complimentary white-glove delivery included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductUI;