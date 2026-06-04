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
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .shimmer-box {
    background: linear-gradient(90deg, #1c1510 25%, #2a1f16 50%, #1c1510 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 2px;
  }

  .coupon-row {
    animation: slideIn 0.4s ease both;
    transition: background 0.3s;
  }
  .coupon-row:hover { background: rgba(200,169,126,0.03); }

  .admin-input {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(200,169,126,0.15);
    padding: 12px 14px;
    font-size: 12px;
    color: white;
    letter-spacing: 0.08em;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.3s, background 0.3s;
    font-family: monospace;
  }
  .admin-input:focus {
    border-color: rgba(200,169,126,0.5);
    background: rgba(200,169,126,0.03);
  }
  .admin-input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 0.15em; }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    transition: color 0.2s, opacity 0.2s;
    position: relative;
  }
  .action-btn::after {
    content: '';
    position: absolute;
    bottom: 2px; left: 8px;
    width: 0; height: 1px;
    transition: width 0.25s;
  }
  .action-btn:hover::after { width: calc(100% - 16px); }

  .toggle-pill {
    width: 36px; height: 20px;
    border-radius: 10px;
    border: 1px solid rgba(200,169,126,0.3);
    cursor: pointer;
    position: relative;
    transition: background 0.3s, border-color 0.3s;
    flex-shrink: 0;
  }
  .toggle-pill::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 12px; height: 12px;
    border-radius: 50%;
    background: rgba(200,169,126,0.4);
    transition: transform 0.3s, background 0.3s;
  }
  .toggle-pill.on {
    background: rgba(200,169,126,0.15);
    border-color: #c8a97e;
  }
  .toggle-pill.on::after {
    transform: translateX(16px);
    background: #c8a97e;
  }

  .create-btn {
    position: relative;
    overflow: hidden;
    transition: background 0.4s;
  }
  .create-btn::before {
    content: '';
    position: absolute;
    left: -100%; top: 0;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transition: left 0.5s;
  }
  .create-btn:hover::before { left: 100%; }
`;

/* ── Confirm Delete Modal ── */
const DeleteModal = ({ coupon, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 50,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
  }}>
    <div style={{
      background: "#100c08", border: "1px solid rgba(200,169,126,0.2)",
      padding: "clamp(24px,4vw,40px)", maxWidth: 360, width: "100%",
      animation: "fadeUp 0.3s ease",
    }}>
      <div style={{ height: 1, background: "linear-gradient(to right, #c8a97e, transparent)", marginBottom: 24 }} />
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "#f5ede0", marginBottom: 8 }}>
        Delete Coupon?
      </p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em", marginBottom: 28, lineHeight: 1.6 }}>
        <span style={{ color: "#c8a97e" }}>{coupon.code}</span> will be permanently removed.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, padding: "12px 0", border: "1px solid rgba(200,169,126,0.2)", background: "none", color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{ flex: 1, padding: "12px 0", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [form, setForm] = useState({ code: "", discountpercent: "", active: true });

  /* ── Fetch ── */
  const fetchCoupons = async () => {
    try {
      const { data } = await axiosInstance.get("/coupon");
      setCoupons(data);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  /* ── Create ── */
  const handleCreate = async () => {
    if (!form.code.trim() || !form.discountpercent) {
      return toast.error("Code and discount are required");
    }
    if (Number(form.discountpercent) <= 0 || Number(form.discountpercent) > 100) {
      return toast.error("Discount must be between 1–100");
    }
    setSubmitting(true);
    try {
      await axiosInstance.post("/coupon/create", {
        code: form.code.trim().toUpperCase(),
        discountpercent: Number(form.discountpercent),
        active: form.active,
      });
      toast.success("Coupon created");
      setForm({ code: "", discountpercent: "", active: true });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toggle active (quick) ── */
  const handleToggle = async (coupon) => {
    try {
      await axiosInstance.patch(`/coupon/edit/${coupon._id}`, { active: !coupon.active });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, active: !c.active } : c));
    } catch {
      toast.error("Failed to update");
    }
  };

  /* ── Inline edit save ── */
  const handleEditSave = async (id) => {
    try {
      await axiosInstance.patch(`/coupon/edit/${id}`, {
        code: editValues.code?.toUpperCase().trim(),
        discountpercent: Number(editValues.discountpercent),
      });
      toast.success("Updated");
      setEditingId(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to update");
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/coupon/delete/${deleteTarget._id}`);
      toast.success("Coupon deleted");
      setDeleteTarget(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div style={{ background: "#080604", minHeight: "100vh" }}>
      <style>{styles}</style>
     

      {deleteTarget && (
        <DeleteModal
          coupon={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={{
        padding: "clamp(80px, 12vw, 120px) clamp(16px, 5vw, 80px) 60px",
        maxWidth: 900, margin: "0 auto",
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "clamp(32px, 5vw, 56px)", animation: "fadeUp 0.5s ease" }}>
          <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.5em", color: "rgba(200,169,126,0.5)", textTransform: "uppercase", marginBottom: 10 }}>
            Admin Panel
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(2rem, 6vw, 3rem)", color: "#f5ede0", margin: 0, lineHeight: 1 }}>
            Coupon Registry
          </h1>
          <div style={{ height: 1, background: "linear-gradient(to right, rgba(200,169,126,0.6), transparent)", marginTop: 16 }} />
        </div>

        {/* ── Create Form ── */}
        <div style={{
          background: "rgba(14,9,5,0.8)",
          border: "1px solid rgba(200,169,126,0.12)",
          padding: "clamp(20px, 4vw, 36px)",
          marginBottom: "clamp(32px, 5vw, 48px)",
          animation: "fadeUp 0.5s ease 0.1s both",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ height: 1, background: "linear-gradient(to right, #c8a97e, transparent)", marginBottom: 24 }} />
          <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,126,0.6)", marginBottom: 20 }}>
            Create New Coupon
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "clamp(12px, 2vw, 20px)", marginBottom: 20 }}>
            {/* Code */}
            <div>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(200,169,126,0.45)", textTransform: "uppercase", marginBottom: 8 }}>Code</p>
              <input
                className="admin-input"
                placeholder="SUMMER20"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>

            {/* Discount */}
            <div>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(200,169,126,0.45)", textTransform: "uppercase", marginBottom: 8 }}>Discount %</p>
              <input
                className="admin-input"
                type="number"
                min="1" max="100"
                placeholder="20"
                value={form.discountpercent}
                onChange={e => setForm({ ...form, discountpercent: e.target.value })}
              />
            </div>

            {/* Active toggle */}
            <div>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(200,169,126,0.45)", textTransform: "uppercase", marginBottom: 8 }}>Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44 }}>
                <button
                  className={`toggle-pill ${form.active ? "on" : ""}`}
                  onClick={() => setForm({ ...form, active: !form.active })}
                />
                <span style={{ fontSize: 10, color: form.active ? "#c8a97e" : "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", transition: "color 0.3s" }}>
                  {form.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <button
            className="create-btn"
            onClick={handleCreate}
            disabled={submitting}
            style={{
              background: submitting ? "rgba(200,169,126,0.4)" : "#c8a97e",
              color: "#0f0a07",
              border: "none",
              padding: "13px 32px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Creating..." : "Create Coupon"}
          </button>
        </div>

        {/* ── Coupons Table ── */}
        <div style={{ animation: "fadeUp 0.5s ease 0.2s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,126,0.5)" }}>
              All Coupons
            </p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
              {!loading && `${coupons.length} total`}
            </p>
          </div>

          <div style={{ border: "1px solid rgba(200,169,126,0.1)", overflow: "hidden" }}>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 80px 1fr",
              padding: "10px 20px",
              background: "rgba(200,169,126,0.04)",
              borderBottom: "1px solid rgba(200,169,126,0.08)",
            }}>
              {["Code", "Discount", "Status", "Actions"].map(h => (
                <span key={h} style={{ fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(200,169,126,0.4)" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Loading skeletons */}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", padding: "16px 20px", borderBottom: "1px solid rgba(200,169,126,0.06)", gap: 12 }}>
                <div className="shimmer-box" style={{ height: 12, width: "50%" }} />
                <div className="shimmer-box" style={{ height: 12, width: 40 }} />
                <div className="shimmer-box" style={{ height: 12, width: 36 }} />
                <div className="shimmer-box" style={{ height: 12, width: "60%" }} />
              </div>
            ))}

            {/* Empty */}
            {!loading && coupons.length === 0 && (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(200,169,126,0.3)" }}>
                  No coupons yet
                </p>
              </div>
            )}

            {/* Rows */}
            {!loading && coupons.map((coupon, idx) => (
              <div
                key={coupon._id}
                className="coupon-row"
                style={{
                  borderBottom: idx < coupons.length - 1 ? "1px solid rgba(200,169,126,0.06)" : "none",
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                {editingId === coupon._id ? (
                  /* ── Inline edit row ── */
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", padding: "12px 20px", alignItems: "center", gap: 8 }}>
                    <input
                      className="admin-input"
                      style={{ padding: "6px 10px", fontSize: 11 }}
                      value={editValues.code}
                      onChange={e => setEditValues({ ...editValues, code: e.target.value.toUpperCase() })}
                    />
                    <input
                      className="admin-input"
                      style={{ padding: "6px 10px", fontSize: 11 }}
                      type="number" min="1" max="100"
                      value={editValues.discountpercent}
                      onChange={e => setEditValues({ ...editValues, discountpercent: e.target.value })}
                    />
                    <span />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="action-btn"
                        onClick={() => handleEditSave(coupon._id)}
                        style={{ color: "#c8a97e" }}
                      >
                        Save
                        <span style={{ position: "absolute", bottom: 2, left: 8, width: 0, height: 1, background: "#c8a97e" }} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => setEditingId(null)}
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal row ── */
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", padding: "16px 20px", alignItems: "center" }}>
                    {/* Code */}
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#e6c89c", letterSpacing: "0.12em" }}>
                      {coupon.code}
                    </span>

                    {/* Discount */}
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                      {coupon.discountpercent}%
                    </span>

                    {/* Toggle */}
                    <button
                      className={`toggle-pill ${coupon.active ? "on" : ""}`}
                      onClick={() => handleToggle(coupon)}
                      title={coupon.active ? "Deactivate" : "Activate"}
                    />

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button
                        className="action-btn"
                        onClick={() => { setEditingId(coupon._id); setEditValues({ code: coupon.code, discountpercent: coupon.discountpercent }); }}
                        style={{ color: "rgba(200,169,126,0.7)" }}
                      >
                        Edit
                        <span className="action-btn-line" style={{ position: "absolute", bottom: 2, left: 8, display: "block", width: 0, height: 1, background: "#c8a97e", transition: "width 0.25s" }} />
                      </button>
                      <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 10 }}>·</span>
                      <button
                        className="action-btn"
                        onClick={() => setDeleteTarget(coupon)}
                        style={{ color: "rgba(239,68,68,0.5)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(239,68,68,0.5)"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCoupons;