import { useState, useEffect } from "react";
import axiosInstance from "../../../api/apiInstance.js";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .shimmer-box {
    background: linear-gradient(90deg, #1c1510 25%, #2a1f16 50%, #1c1510 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 2px;
  }
  .offer-row { transition: background 0.3s; }
  .offer-row:hover { background: rgba(200,169,126,0.03); }

  .o-input {
    width: 100%; background: transparent;
    border: 1px solid rgba(200,169,126,0.15);
    padding: 10px 12px; font-size: 12px;
    color: white; letter-spacing: 0.06em;
    outline: none; box-sizing: border-box;
    transition: border-color 0.3s;
    font-family: inherit;
  }
  .o-input:focus { border-color: rgba(200,169,126,0.5); }
  .o-input::placeholder { color: rgba(255,255,255,0.2); }

  .o-select {
    width: 100%; background: #100c08;
    border: 1px solid rgba(200,169,126,0.15);
    padding: 10px 12px; font-size: 12px;
    color: white; outline: none;
    box-sizing: border-box;
    transition: border-color 0.3s;
    cursor: pointer;
  }
  .o-select:focus { border-color: rgba(200,169,126,0.5); }

  .toggle-pill {
    width: 36px; height: 20px; border-radius: 10px;
    border: 1px solid rgba(200,169,126,0.3);
    cursor: pointer; position: relative;
    transition: background 0.3s, border-color 0.3s;
    flex-shrink: 0; background: none;
  }
  .toggle-pill::after {
    content: ''; position: absolute;
    top: 3px; left: 3px;
    width: 12px; height: 12px; border-radius: 50%;
    background: rgba(200,169,126,0.4);
    transition: transform 0.3s, background 0.3s;
  }
  .toggle-pill.on { background: rgba(200,169,126,0.15); border-color: #c8a97e; }
  .toggle-pill.on::after { transform: translateX(16px); background: #c8a97e; }

  .type-badge {
    display: inline-block;
    font-size: 8px; letter-spacing: 0.3em;
    text-transform: uppercase; padding: 3px 8px;
    border-radius: 2px;
  }
`;

const TYPE_COLORS = {
  product:  { color: "#c8a97e",  bg: "rgba(200,169,126,0.1)",  border: "rgba(200,169,126,0.3)"  },
  category: { color: "#818cf8",  bg: "rgba(129,140,248,0.1)",  border: "rgba(129,140,248,0.3)"  },
  flash:    { color: "#f87171",  bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)"  },
  bogo:     { color: "#34d399",  bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)"   },
};

const EMPTY_FORM = {
  title: "", type: "product", productId: "",
  category: "", discountPercent: "",
  bogoConfig: { buyQty: 2, getFree: 1 },
  active: true, startDate: "", endDate: "",
};

const Label = ({ children }) => (
  <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(200,169,126,0.45)", textTransform: "uppercase", marginBottom: 6 }}>
    {children}
  </p>
);

const DeleteModal = ({ offer, onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ background: "#100c08", border: "1px solid rgba(200,169,126,0.2)", padding: "clamp(24px,4vw,40px)", maxWidth: 360, width: "100%", animation: "fadeUp 0.3s ease" }}>
      <div style={{ height: 1, background: "linear-gradient(to right, #c8a97e, transparent)", marginBottom: 20 }} />
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "#f5ede0", marginBottom: 8 }}>Remove Offer?</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 28, lineHeight: 1.6 }}>
        <span style={{ color: "#c8a97e" }}>{offer.title}</span> will be permanently deleted.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "12px 0", border: "1px solid rgba(200,169,126,0.2)", background: "none", color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "12px 0", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}>Delete</button>
      </div>
    </div>
  </div>
);

const AdminOffers = () => {
  const [offers, setOffers]           = useState([]);
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);

  const fetchOffers = async () => {
    try {
      const { data } = await axiosInstance.get("/offers");
      setOffers(data);
    } catch { toast.error("Failed to load offers"); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("/products"); // adjust if different
      setProducts(data);
    } catch {}
  };

  useEffect(() => { fetchOffers(); fetchProducts(); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setBogo = (key, val) => setForm(f => ({ ...f, bogoConfig: { ...f.bogoConfig, [key]: val } }));

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.type !== "bogo" && (!form.discountPercent || Number(form.discountPercent) <= 0))
      return toast.error("Discount % is required");
    if (form.type === "product" && !form.productId)
      return toast.error("Select a product");
    if (form.type === "category" && !form.category.trim())
      return toast.error("Enter a category");

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        active: form.active,
        discountPercent: Number(form.discountPercent) || 0,
        productId: ["product", "flash"].includes(form.type) ? form.productId || null : null,
        category:  form.type === "category" ? form.category.trim() : null,
        bogoConfig: form.type === "bogo" ? { buyQty: Number(form.bogoConfig.buyQty), getFree: Number(form.bogoConfig.getFree) } : undefined,
        startDate: form.startDate || null,
        endDate:   form.endDate   || null,
      };
      await axiosInstance.post("/offers/create", payload);
      toast.success("Offer created");
      setForm(EMPTY_FORM);
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create offer");
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (offer) => {
    try {
      await axiosInstance.patch(`/offers/edit/${offer._id}`, { active: !offer.active });
      setOffers(prev => prev.map(o => o._id === offer._id ? { ...o, active: !o.active } : o));
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/offers/delete/${deleteTarget._id}`);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchOffers();
    } catch { toast.error("Failed to delete"); }
  };

  const tc = (type) => TYPE_COLORS[type] || TYPE_COLORS.product;

  return (
    <div style={{ background: "#080604", minHeight: "100vh" }}>
      <style>{styles}</style>

      {deleteTarget && <DeleteModal offer={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      <div style={{ padding: "clamp(80px,12vw,120px) clamp(16px,5vw,80px) 60px", maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(32px,5vw,52px)", animation: "fadeUp 0.5s ease" }}>
          <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.5em", color: "rgba(200,169,126,0.5)", textTransform: "uppercase", marginBottom: 10 }}>Admin Panel</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(2rem,6vw,3rem)", color: "#f5ede0", margin: 0, lineHeight: 1 }}>
            Offer Registry
          </h1>
          <div style={{ height: 1, background: "linear-gradient(to right, rgba(200,169,126,0.6), transparent)", marginTop: 16 }} />
        </div>

        {/* Create Form */}
        <div style={{ background: "rgba(14,9,5,0.8)", border: "1px solid rgba(200,169,126,0.12)", padding: "clamp(20px,4vw,36px)", marginBottom: "clamp(32px,5vw,48px)", animation: "fadeUp 0.5s ease 0.1s both", backdropFilter: "blur(8px)" }}>
          <div style={{ height: 1, background: "linear-gradient(to right, #c8a97e, transparent)", marginBottom: 24 }} />
          <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,126,0.6)", marginBottom: 20 }}>
            Create New Offer
          </p>

          {/* Row 1: Title + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "clamp(12px,2vw,20px)", marginBottom: "clamp(12px,2vw,20px)" }}>
            <div>
              <Label>Offer Title</Label>
              <input className="o-input" placeholder="Summer Flash Sale" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div>
              <Label>Offer Type</Label>
              <select className="o-select" value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="product">Product Discount</option>
                <option value="category">Category Discount</option>
                <option value="flash">Flash Sale</option>
                {/* <option value="bogo">Buy X Get Y</option> */}
              </select>
            </div>
          </div>

          {/* Row 2: Type-specific fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "clamp(12px,2vw,20px)", marginBottom: "clamp(12px,2vw,20px)" }}>

            {/* Product picker */}
            {(form.type === "product" || form.type === "flash") && (
              <div>
                <Label>Product</Label>
                <select className="o-select" value={form.productId} onChange={e => set("productId", e.target.value)}>
                  <option value="">— Select product —</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            )}

            {/* Category input */}
            {form.type === "category" && (
              <div>
                <Label>Category</Label>
                <input className="o-input" placeholder="e.g. Shoes" value={form.category} onChange={e => set("category", e.target.value)} />
              </div>
            )}

            {/* Discount % */}
            {form.type !== "bogo" && (
              <div>
                <Label>Discount %</Label>
                <input className="o-input" type="number" min="1" max="100" placeholder="20" value={form.discountPercent} onChange={e => set("discountPercent", e.target.value)} />
              </div>
            )}

            {/* BOGO config */}
            {form.type === "bogo" && (
              <>
                <div>
                  <Label>Buy Qty</Label>
                  <input className="o-input" type="number" min="1" placeholder="2" value={form.bogoConfig.buyQty} onChange={e => setBogo("buyQty", e.target.value)} />
                </div>
                <div>
                  <Label>Get Free</Label>
                  <input className="o-input" type="number" min="1" placeholder="1" value={form.bogoConfig.getFree} onChange={e => setBogo("getFree", e.target.value)} />
                </div>
              </>
            )}

            {/* Flash date range */}
            {form.type === "flash" && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <input className="o-input" type="datetime-local" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                    style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <input className="o-input" type="datetime-local" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                    style={{ colorScheme: "dark" }} />
                </div>
              </>
            )}

            {/* Active toggle */}
            <div>
              <Label>Status</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42 }}>
                <button className={`toggle-pill ${form.active ? "on" : ""}`} onClick={() => set("active", !form.active)} />
                <span style={{ fontSize: 10, color: form.active ? "#c8a97e" : "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", transition: "color 0.3s" }}>
                  {form.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            style={{ background: submitting ? "rgba(200,169,126,0.4)" : "#c8a97e", color: "#0f0a07", border: "none", padding: "13px 32px", fontSize: 9, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", transition: "background 0.3s", marginTop: 8 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#f5deb3"; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#c8a97e"; }}
          >
            {submitting ? "Creating..." : "Create Offer"}
          </button>
        </div>

        {/* Offers Table */}
        <div style={{ animation: "fadeUp 0.5s ease 0.2s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,126,0.5)" }}>All Offers</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>{!loading && `${offers.length} total`}</p>
          </div>

          <div style={{ border: "1px solid rgba(200,169,126,0.1)", overflow: "hidden" }}>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 90px 100px 80px 90px", padding: "10px 20px", background: "rgba(200,169,126,0.04)", borderBottom: "1px solid rgba(200,169,126,0.08)" }}>
              {["Title", "Type", "Details", "Status", "Actions"].map(h => (
                <span key={h} style={{ fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(200,169,126,0.4)" }}>{h}</span>
              ))}
            </div>

            {/* Loading */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 90px 100px 80px 90px", padding: "16px 20px", borderBottom: "1px solid rgba(200,169,126,0.06)", gap: 12 }}>
                {Array.from({ length: 5 }).map((__, j) => <div key={j} className="shimmer-box" style={{ height: 12 }} />)}
              </div>
            ))}

            {/* Empty */}
            {!loading && offers.length === 0 && (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(200,169,126,0.3)" }}>No offers yet</p>
              </div>
            )}

            {/* Rows */}
            {!loading && offers.map((offer, idx) => (
              <div key={offer._id} className="offer-row" style={{ display: "grid", gridTemplateColumns: "2fr 90px 100px 80px 90px", padding: "14px 20px", alignItems: "center", borderBottom: idx < offers.length - 1 ? "1px solid rgba(200,169,126,0.06)" : "none", animationDelay: `${idx * 50}ms` }}>

                {/* Title */}
                <div>
                  <p style={{ fontSize: 12, color: "rgba(245,237,224,0.85)", letterSpacing: "0.03em", marginBottom: 2 }}>{offer.title}</p>
                  {offer.productId && <p style={{ fontSize: 9, color: "rgba(200,169,126,0.45)", letterSpacing: "0.08em" }}>{offer.productId.name}</p>}
                  {offer.category  && <p style={{ fontSize: 9, color: "rgba(200,169,126,0.45)", letterSpacing: "0.08em" }}>{offer.category}</p>}
                </div>

                {/* Type badge */}
                <span className="type-badge" style={{ color: tc(offer.type).color, background: tc(offer.type).bg, border: `1px solid ${tc(offer.type).border}` }}>
                  {offer.type}
                </span>

                {/* Details */}
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                  {offer.type === "bogo"
                    ? `B${offer.bogoConfig?.buyQty} G${offer.bogoConfig?.getFree}`
                    : `${offer.discountPercent}% off`}
                </span>

                {/* Toggle */}
                <button className={`toggle-pill ${offer.active ? "on" : ""}`} onClick={() => handleToggle(offer)} />

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(offer)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(239,68,68,0.5)", padding: 0, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(239,68,68,0.5)"}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;