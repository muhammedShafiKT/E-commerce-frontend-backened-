import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./Cartprovider.jsx";
import { Navbar } from "./Navbar.jsx";
import "../../../index.css";

const shimmerStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .shimmer-box {
    background: linear-gradient(90deg, #1c1510 25%, #2a1f16 50%, #1c1510 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 2px;
  }

  .cart-item { animation: fadeUp 0.5s ease both; }

  .qty-btn { position: relative; overflow: hidden; }
  .qty-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(200,169,126,0.12);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .qty-btn:hover::after { opacity: 1; }

  .checkout-btn { position: relative; overflow: hidden; }
  .checkout-btn::before {
    content: '';
    position: absolute;
    left: -100%; top: 0;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transition: left 0.6s ease;
  }
  .checkout-btn:hover::before { left: 100%; }

  .line-grow {
    transform-origin: left;
    animation: lineGrow 0.8s cubic-bezier(0.16,1,0.3,1) both;
  }

  .remove-btn { position: relative; }
  .remove-btn::before {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 0; height: 1px;
    background: #ef4444;
    transition: width 0.25s ease;
  }
  .remove-btn:hover::before { width: 100%; }

  @media (max-width: 480px) {
    .cart-item-row { gap: 14px !important; }
    .cart-item-image { width: 70px !important; height: 96px !important; }
    .cart-item-title { font-size: 15px !important; }
    .summary-panel { padding: 20px !important; }
    .cart-grand-total { font-size: 22px !important; }
  }
`;

const Cart = () => {
  const { cart, increaseQty, decreaseQty, removeItem, fetchCart, loading } = useCart();
  const navigate = useNavigate();
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCart(),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]).finally(() => setMinLoading(false));
  }, []);

  const isLoading = loading || minLoading;
  const baseTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalSavings = cart.reduce((acc, item) => {
    if (item.discountPercent > 0 && item.originalPrice) {
      return acc + (item.originalPrice - item.price) * item.qty;
    }
    return acc;
  }, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  if (!isLoading && cart.length === 0) {
    return (
      <div style={{ background: "#080604", minHeight: "100vh" }}>
        <style>{shimmerStyle}</style>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "24px", padding: "0 24px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(200,169,126,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(200,169,126,0.3)" }} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(18px, 5vw, 22px)", color: "rgba(200,169,126,0.5)", letterSpacing: "0.2em" }}>
            Your Cart is Empty
          </p>
          <button
            onClick={() => navigate("/")}
            style={{ marginTop: 8, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(200,169,126,0.6)", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid rgba(200,169,126,0.2)", paddingBottom: 2 }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#080604", minHeight: "100vh" }}>
      <style>{shimmerStyle}</style>
      <Navbar />

      <div
        className="min-h-screen text-white"
        style={{
          background: "radial-gradient(ellipse at top right, #1a100640 0%, transparent 60%), #080604",
          padding: "clamp(48px, 8vw, 80px) clamp(16px, 5vw, 80px)",
        }}
      >
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div className="mb-16" style={{ animation: "fadeUp 0.6s ease both" }}>
            <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.45em", color: "rgba(200,169,126,0.5)", textTransform: "uppercase", marginBottom: 10 }}>
              {!isLoading && `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(1.8rem, 6vw, 3.5rem)", letterSpacing: "0.04em", lineHeight: 1, color: "#f5ede0" }}>
              Shopping Cart
            </h1>
            <div className="line-grow" style={{ height: 1, background: "linear-gradient(to right, rgba(200,169,126,0.6), transparent)", marginTop: 14, width: "100%" }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

            {/* RIGHT: Summary */}
            <div className="lg:col-span-1 order-first lg:order-last">
              {isLoading ? (
                <div style={{ background: "rgba(20,13,8,0.6)", border: "1px solid rgba(200,169,126,0.1)", padding: "clamp(20px,4vw,32px)", display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="shimmer-box" style={{ height: 10, width: 80 }} />
                  <div className="shimmer-box" style={{ height: 28, width: "70%" }} />
                  <div className="shimmer-box" style={{ height: 1, width: "100%" }} />
                  <div className="shimmer-box" style={{ height: 48, width: "100%" }} />
                </div>
              ) : (
                <div
                  className="summary-panel"
                  style={{
                    background: "rgba(14,9,5,0.7)",
                    border: "1px solid rgba(200,169,126,0.12)",
                    padding: "clamp(20px, 4vw, 32px)",
                    position: "sticky",
                    top: 100,
                    backdropFilter: "blur(8px)",
                    animation: "fadeUp 0.7s ease 0.2s both",
                  }}
                >
                  <div style={{ height: 1, background: "linear-gradient(to right, #c8a97e, transparent)", marginBottom: 24 }} />

                  <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,126,0.6)", marginBottom: 20 }}>
                    Order Summary
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                        ₹ {baseTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Total savings row — only shown if any discount exists */}
                    {totalSavings > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "rgba(74,222,128,0.7)", letterSpacing: "0.05em" }}>
                          Total Savings
                        </span>
                        <span style={{ fontSize: 11, color: "#4ade80" }}>
                          − ₹ {totalSavings.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>Shipping</span>
                      <span style={{ fontSize: 11, color: "rgba(200,169,126,0.6)", letterSpacing: "0.05em" }}>Calculated later</span>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "rgba(200,169,126,0.1)", marginBottom: 20 }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
                    <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Grand Total</span>
                    <span
                      className="cart-grand-total"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(20px, 4vw, 26px)", color: "#e6c89c" }}
                    >
                      ₹ {baseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() => navigate("/detailsandpayment")}
                    style={{
                      width: "100%",
                      background: "#c8a97e",
                      color: "#0f0a07",
                      border: "none",
                      padding: "clamp(12px, 3vw, 15px) 0",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "background 0.4s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5deb3"}
                    onMouseLeave={e => e.currentTarget.style.background = "#c8a97e"}
                  >
                    Proceed to Checkout
                  </button>

                  <p style={{ marginTop: 16, fontSize: 8, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.35em", textAlign: "center" }}>
                    Taxes calculated at checkout
                  </p>
                </div>
              )}
            </div>

            {/* LEFT: Items */}
            <div className="lg:col-span-2 order-last lg:order-first" style={{ minWidth: 0 }}>

              {/* Shimmer skeletons */}
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 28, marginBottom: 28, borderBottom: "1px solid rgba(200,169,126,0.08)" }}>
                  <div className="shimmer-box" style={{ width: 80, height: 110, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="shimmer-box" style={{ height: 16, width: "60%" }} />
                    <div className="shimmer-box" style={{ height: 12, width: "30%" }} />
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
                      <div className="shimmer-box" style={{ height: 32, width: 90 }} />
                      <div className="shimmer-box" style={{ height: 12, width: 50 }} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Actual items */}
              {!isLoading && cart.map((item, idx) => (
                <div
                  key={item.productId}
                  className="cart-item cart-item-row"
                  style={{
                    animationDelay: `${idx * 80}ms`,
                    display: "flex",
                    gap: "clamp(14px, 3vw, 24px)",
                    paddingBottom: "clamp(24px, 4vw, 36px)",
                    marginBottom: "clamp(24px, 4vw, 36px)",
                    borderBottom: "1px solid rgba(200,169,126,0.08)",
                  }}
                >
                  {/* Image */}
                  <div
                    className="cart-item-image"
                    style={{
                      width: "clamp(70px, 12vw, 88px)",
                      height: "clamp(96px, 16vw, 120px)",
                      flexShrink: 0,
                      background: "#12100d",
                      border: "1px solid rgba(200,169,126,0.08)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    
                    {/* {item.discountPercent > 0 && (
                      <div style={{
                        position: "absolute", top: 5, left: 5, zIndex: 2,
                        background: "rgba(74,222,128,0.15)",
                        border: "1px solid rgba(74,222,128,0.4)",
                        color: "#4ade80",
                        fontSize: 8, letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        padding: "2px 5px",
                        lineHeight: 1.4,
                      }}>
                        {item.discountPercent}% off
                      </div>
                    )} */}
                    <img
                      src={item.image}
                      alt={item.description}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease, opacity 0.4s ease", opacity: 0.85 }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "0.85"; }}
                    />
                    <div style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, borderTop: "1px solid rgba(200,169,126,0.4)", borderRight: "1px solid rgba(200,169,126,0.4)" }} />
                    <div style={{ position: "absolute", bottom: 5, left: 5, width: 8, height: 8, borderBottom: "1px solid rgba(200,169,126,0.4)", borderLeft: "1px solid rgba(200,169,126,0.4)" }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                    <div>
                      <h3
                        className="cart-item-title"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "clamp(14px, 3vw, 17px)", color: "rgba(245,237,224,0.92)", letterSpacing: "0.02em", lineHeight: 1.3, wordBreak: "break-word" }}
                      >
                        {item.description}
                      </h3>

                      {/* Price row: strikethrough original + discounted */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        {item.discountPercent > 0 && item.originalPrice && (
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "line-through", letterSpacing: "0.03em" }}>
                            ₹ {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span style={{ fontSize: "clamp(11px, 2.5vw, 12px)", color: "#c8a97e", fontWeight: 300, letterSpacing: "0.05em" }}>
                          ₹ {item.price.toLocaleString()}
                        </span>
                        {item.discountPercent > 0 && (
                          <span style={{
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "#4ade80",
                            border: "1px solid rgba(74,222,128,0.3)",
                            background: "rgba(74,222,128,0.07)",
                            padding: "2px 6px",
                          }}>
                            {item.discountPercent}% off
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
                      {/* Qty control */}
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(200,169,126,0.18)" }}>
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQty(item.productId)}
                          style={{ width: 36, height: 36, color: "#c8a97e", background: "none", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s", touchAction: "manipulation" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#f5deb3"}
                          onMouseLeave={e => e.currentTarget.style.color = "#c8a97e"}
                        >−</button>
                        <span style={{ minWidth: 32, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.75)", borderLeft: "1px solid rgba(200,169,126,0.15)", borderRight: "1px solid rgba(200,169,126,0.15)", height: 36, lineHeight: "36px" }}>
                          {item.qty}
                        </span>
                        <button
                          className="qty-btn"
                          // disabled={}
                          onClick={() => increaseQty(item.productId)
                          }
                          style={{ width: 36, height: 36, color: "#c8a97e", background: "none", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s", touchAction: "manipulation" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#f5deb3"}
                          onMouseLeave={e => e.currentTarget.style.color = "#c8a97e"}
                        >+</button>
                      </div>

                      {/* Subtotal + Remove */}
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 13, color: "rgba(230,200,156,0.9)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                          ₹ {(item.price * item.qty).toLocaleString()}
                        </p>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(String(item.productId))}
                          style={{ marginTop: 6, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s", padding: 0, touchAction: "manipulation" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;