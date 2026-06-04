import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./Cartprovider.jsx";
import { Navbar } from "./Navbar.jsx";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/apiInstance.js";
import axios from "axios";

/* ─── Coupon Panel ─── */
const CouponPanel = ({ onCouponApplied, activeCart, baseTotal }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    setCode(val);
    if (val.trim() === "" && applied) {
      setStatus(null);
      setApplied(false);
      onCouponApplied(null, null);
    }
  };

  const applyCode = async () => {
    if (!code.trim()) return;
    setApplying(true);
    setStatus(null);
    try {
      const { data } = await axios.post(
        "/api/coupon/apply",
        { couponcode: code.trim(), items: activeCart, total: baseTotal },
        { withCredentials: true }
      );
      setStatus({ type: "success", msg: data.coupon, discount: data.discount, final: data.Finaltotal });
      setApplied(true);
      onCouponApplied(data.Finaltotal, data.discount);
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || err.message });
      setApplied(false);
    } finally {
      setApplying(false);
    }
  };

  const removeCode = () => {
    setCode("");
    setStatus(null);
    setApplied(false);
    onCouponApplied(null, null);
  };

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(200,169,126,0.1)" }}>
      <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(200,169,126,0.6)", marginBottom: 10 }}>
        Coupon Code
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={code}
          onChange={handleCodeChange}
          placeholder="ENTER CODE"
          disabled={applied}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid rgba(200,169,126,0.2)",
            padding: "10px 12px",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: applied ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
            outline: "none",
            minWidth: 0,
            transition: "border-color 0.3s",
            cursor: applied ? "not-allowed" : "text",
          }}
          onFocus={(e) => { if (!applied) e.currentTarget.style.borderColor = "rgba(200,169,126,0.5)"; }}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,126,0.2)")}
        />

        {applied ? (
          <button
            onClick={removeCode}
            style={{
              padding: "10px 16px",
              border: "1px solid rgba(248,113,113,0.4)",
              color: "rgba(248,113,113,0.8)",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.3s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            Remove
          </button>
        ) : (
          <button
            onClick={applyCode}
            disabled={applying}
            style={{
              padding: "10px 16px",
              border: "1px solid rgba(200,169,126,0.4)",
              color: "#c8a97e",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "none",
              cursor: applying ? "not-allowed" : "pointer",
              opacity: applying ? 0.4 : 1,
              whiteSpace: "nowrap",
              transition: "background 0.3s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!applying) e.currentTarget.style.background = "rgba(200,169,126,0.1)"; }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            {applying ? "..." : "Apply"}
          </button>
        )}
      </div>

      {status && (
        <div style={{
          marginTop: 10,
          fontSize: 10,
          letterSpacing: "0.05em",
          color: status.type === "success" ? "rgba(52,211,153,0.8)" : "rgba(248,113,113,0.8)",
        }}>
          {status.type === "success" ? (
            <>
              <span style={{ color: "#c8a97e" }}>"{status.msg}"</span> applied — you save ₹{status.discount?.toLocaleString()}
              <div style={{ marginTop: 4, color: "rgba(255,255,255,0.4)" }}>
                New total: <span style={{ color: "#e6c89c" }}>₹{status.final?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : (
            status.msg
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main ─── */
const DetailsAndPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();

  const buyNowProduct = location.state?.buyNowProduct;

  const activeCart = buyNowProduct
    ? [{
        productId: buyNowProduct.id,
        name: buyNowProduct.name,
        description: buyNowProduct.description,
        price: buyNowProduct.finalPrice ?? buyNowProduct.price,
        image: Array.isArray(buyNowProduct.images) ? buyNowProduct.images[0] : buyNowProduct.images,
        qty: 1,
      }]
    : cart;

  const baseTotal = activeCart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const [discountedTotal, setDiscountedTotal] = useState(null);
  const [savedAmount, setSavedAmount] = useState(null);
  const totalPrice = discountedTotal ?? baseTotal;

  const handleCouponApplied = (finalTotal, discount) => {
    setDiscountedTotal(finalTotal);
    setSavedAmount(discount);
  };

  const [details, setDetails] = useState({
    name: "", email: "", phone: "", address: "", city: "", pincode: "",
  });

  useEffect(() => {
    const prefill = async () => {
      try {
        const { data } = await axiosInstance.get("/orders/last-details");
        if (data) setDetails(data);
      } catch { /* skip */ }
    };
    prefill();
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const handleChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    await axiosInstance.post("/orders", {
      customer: details,
      paymentMethod,
      items: activeCart.map((item) => ({
        productId: item.productId,
        description: item.description || item.name,
        price: item.price,
        image: item.image,
        qty: item.qty,
      })),
      total: totalPrice,
    });
    if (!buyNowProduct) clearCart();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeCart.length === 0) return toast.error("Cart is empty");

    if (paymentMethod === "cod") {
      try {
        await placeOrder();
        navigate("/orders");
      } catch {
        toast.error("Order failed");
      }
      return;
    }

    try {
      const { data } = await axiosInstance.post("/payment/create-order", { amount: totalPrice });
      const options = {
        key: "rzp_test_SFE4IMvFDZ3PMd",
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        handler: async (response) => {
          await axiosInstance.post("/payment/verify", response);
          await placeOrder();
          navigate("/orders");
        },
        prefill: { name: details.name, email: details.email, contact: details.phone },
        theme: { color: "#c8a97e" },
      };
      new window.Razorpay(options).open();
    } catch {
      toast.error("Payment failed");
    }
  };

  return (
    <div style={{ background: "#0a0705", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "clamp(80px, 12vw, 128px) clamp(16px, 5vw, 80px) clamp(40px, 6vw, 80px)", color: "white" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-5 order-first lg:order-last">
              <div style={{
                position: "sticky",
                top: 100,
                background: "#0f0a07",
                border: "1px solid rgba(200,169,126,0.1)",
                padding: "clamp(20px, 4vw, 40px)",
              }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "clamp(18px, 4vw, 24px)", color: "white", marginBottom: 24 }}>
                  {buyNowProduct ? "Your Order" : "Your Collection"}
                </h2>

                <div
                  style={{ maxHeight: "35vh", overflowY: "auto", paddingRight: 8, marginBottom: 0 }}
                  className="custom-scrollbar"
                >
                  {activeCart.map((item) => (
                    <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "white", fontSize: "clamp(11px, 2vw, 13px)", letterSpacing: "0.03em", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word", textTransform: "capitalize" }}>
                          {item.name || item.description}
                        </p>
                        <p style={{ color: "rgba(200,169,126,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Qty: {item.qty}
                        </p>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 300, whiteSpace: "nowrap" }}>
                        ₹{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(200,169,126,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ color: "rgba(200,169,126,0.4)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>Subtotal</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 300,
                      color: savedAmount ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.4)",
                      textDecoration: savedAmount ? "line-through" : "none",
                    }}>
                      ₹{baseTotal.toLocaleString()}
                    </span>
                  </div>

                  {savedAmount && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ color: "rgba(52,211,153,0.7)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>Coupon Discount</span>
                      <span style={{ color: "rgba(52,211,153,0.8)", fontSize: 12 }}>− ₹{savedAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <span style={{ color: "rgba(200,169,126,0.4)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>Delivery</span>
                    <span style={{ color: "#c8a97e", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>Complimentary</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, borderTop: "1px solid rgba(200,169,126,0.1)" }}>
                    <span style={{ color: "#c8a97e", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "clamp(22px, 5vw, 30px)", color: "white", letterSpacing: "-0.02em" }}>
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <CouponPanel
                  onCouponApplied={handleCouponApplied}
                  activeCart={activeCart}
                  baseTotal={baseTotal}
                />

                <p style={{ marginTop: 20, fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.3em", textAlign: "center" }}>
                  Secure transaction guaranteed by Luxora
                </p>
              </div>
            </div>

            {/* DELIVERY FORM */}
            <div className="lg:col-span-7 order-last lg:order-first">
              <header style={{ marginBottom: "clamp(32px, 6vw, 48px)" }}>
                <p style={{ color: "#c8a97e", fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: 8 }}>Checkout</p>
                <h1 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "clamp(24px, 6vw, 36px)", color: "white", margin: 0 }}>
                  Delivery Registry
                </h1>
                <div style={{ width: 48, height: 1, background: "rgba(200,169,126,0.4)", marginTop: 16 }} />
              </header>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "clamp(24px, 4vw, 40px) clamp(16px, 3vw, 32px)" }}>
                  {["name", "email", "phone", "address", "city", "pincode"].map((field) => (
                    <div
                      key={field}
                      style={{ position: "relative", gridColumn: field === "address" ? "1 / -1" : undefined }}
                    >
                      <input
                        name={field}
                        value={details[field]}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        style={{
                          width: "100%",
                          background: "transparent",
                          borderBottom: "1px solid rgba(200,169,126,0.2)",
                          borderTop: "none", borderLeft: "none", borderRight: "none",
                          padding: "8px 0",
                          fontSize: 14,
                          color: "white",
                          outline: "none",
                          boxSizing: "border-box",
                          transition: "border-color 0.4s",
                        }}
                        className="peer"
                        onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#c8a97e")}
                        onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(200,169,126,0.2)")}
                      />
                      <label style={{
                        position: "absolute",
                        left: 0,
                        top: -14,
                        fontSize: 9,
                        color: "rgba(200,169,126,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        pointerEvents: "none",
                      }}>
                        {field}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Payment Method */}
                <div style={{ marginTop: "clamp(32px, 5vw, 48px)" }}>
                  <h2 style={{ color: "#c8a97e", fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: 20 }}>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-3" style={{ gap: "clamp(8px, 2vw, 16px)" }}>
                    {["cod", "card", "upi"].map((method) => (
                      <label
                        key={method}
                        style={{
                          cursor: "pointer",
                          border: `1px solid ${paymentMethod === method ? "#c8a97e" : "rgba(200,169,126,0.1)"}`,
                          padding: "clamp(12px, 2vw, 16px) 8px",
                          textAlign: "center",
                          background: paymentMethod === method ? "rgba(200,169,126,0.05)" : "transparent",
                          transition: "all 0.4s",
                          display: "block",
                        }}
                      >
                        <input
                          type="radio"
                          style={{ display: "none" }}
                          name="payment"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                        />
                        <span style={{
                          fontSize: "clamp(9px, 2vw, 10px)",
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: paymentMethod === method ? "white" : "rgba(255,255,255,0.4)",
                        }}>
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    background: "#c8a97e",
                    color: "black",
                    border: "none",
                    padding: "clamp(14px, 3vw, 20px) 0",
                    marginTop: "clamp(28px, 5vw, 40px)",
                    fontSize: "clamp(9px, 2vw, 11px)",
                    fontWeight: 700,
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "background 0.4s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#c8a97e")}
                >
                  Confirm Acquisition
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(200,169,126,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c8a97e; }
      `}</style>
    </div>
  );
};

export default DetailsAndPayment;