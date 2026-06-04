import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import axiosInstance from "../../../api/apiInstance";



const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: "text-yellow-400",
  processing: "text-blue-400",
  shipped: "text-purple-400",
  delivered: "text-green-400",
  cancelled: "text-rose-500",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/orders/adminorders");
      setOrders(res.data || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axiosInstance.patch(`/orders/admin/${orderId}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axiosInstance.delete(`/orders/admin/${orderId}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const filtered = orders
    .filter(o => filter === "all" || o.status === filter)
    .filter(o =>
      search === "" ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-8 pb-20 px-4 lg:px-0">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-serif italic text-white underline decoration-[#c8a97e]/30 underline-offset-8">
          Order Management
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* SEARCH */}
          {/* <input
            type="text"
            placeholder="Search by order ID or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#0f0a07] border border-[#c8a97e]/20 text-white text-xs px-4 py-2 outline-none focus:border-[#c8a97e] transition-colors w-full sm:w-64 placeholder:text-white/20"
          /> */}

          {/* FILTER */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-[#0f0a07] border border-[#c8a97e]/20 text-[#c8a97e] text-[10px] uppercase tracking-widest px-4 py-2 outline-none"
          >
            <option value="all">All Orders</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* STATUS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <div
              key={s}
              onClick={() => setFilter(filter === s ? "all" : s)}
              className={`border p-4 cursor-pointer transition-all duration-300 ${
                filter === s
                  ? "border-[#c8a97e] bg-[#c8a97e]/5"
                  : "border-[#c8a97e]/10 hover:border-[#c8a97e]/30"
              }`}
            >
              <p className={`text-2xl font-serif italic ${STATUS_COLORS[s]}`}>{count}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{s}</p>
            </div>
          );
        })}
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-white/40 text-sm">Loading orders...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <div className="border border-[#c8a97e]/10 p-12 text-center">
          <p className="text-white/30 text-sm uppercase tracking-widest">No orders found</p>
        </div>
      )}

      {/* ORDER CARDS */}
      <div className="space-y-6">
        {filtered.map(order => (
          <div
            key={order._id}
            className="bg-[#1a140e]/40 border border-[#c8a97e]/10 p-6 lg:p-8"
          >
            {/* ORDER HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-sm uppercase tracking-widest text-[#c8a97e]">
                  {order.orderId}
                </h2>
                <p className="text-[10px] text-white/30 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* STATUS SELECT */}
                <select
                  value={order.status}
                  onChange={e => updateStatus(order._id, e.target.value)}
                  className={`bg-[#0f0a07] border border-[#c8a97e]/20 text-[10px] uppercase tracking-widest px-3 py-2 outline-none cursor-pointer ${STATUS_COLORS[order.status]}`}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} className="text-white">
                      {s}
                    </option>
                  ))}
                </select>

                {/* DELETE */}
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="text-rose-900 hover:text-rose-500 transition-colors text-[10px] uppercase tracking-widest border border-rose-900/30 hover:border-rose-500/50 px-3 py-2"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="space-y-3 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.description}
                        className="w-12 h-12 object-cover border border-[#c8a97e]/10"
                      />
                    )}
                    <span className="text-white/60 text-xs">
                      {item.description} × {item.qty}
                    </span>
                  </div>
                  <span className="text-[#e6c89c] text-xs">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-[#c8a97e]/10 my-4" />

            {/* CUSTOMER + TOTAL */}
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="text-xs text-white/50 space-y-1">
                <p><span className="text-white/30">Customer:</span> {order.customer?.name}</p>
                <p><span className="text-white/30">Email:</span> {order.customer?.email}</p>
                <p><span className="text-white/30">Phone:</span> {order.customer?.phone}</p>
                <p><span className="text-white/30">Address:</span> {order.customer?.address}, {order.customer?.city} - {order.customer?.pincode}</p>
                <p><span className="text-white/30">Payment:</span> {order.paymentMethod?.toUpperCase()}</p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Grand Total</p>
                <p className="text-2xl font-serif italic text-[#e6c89c]">
                  ₹{order.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}