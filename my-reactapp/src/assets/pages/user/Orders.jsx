import { useEffect, useState } from "react";
import { Navbar } from "./Navbar.jsx";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import axiosInstance from "../../../api/apiInstance.js";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/orders", {
        withCredentials: true,
      })
      .then((res) => {
        setOrders(res.data || []);
        console.log(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setLoading(false);
        // Only redirect to login if the server says unauthorized
        if (err.response?.status === 401) {
          navigate("/login");
        }
      });
  }, []);

  return (
    <div className="h-screen overflow-y-auto">
      <Navbar />

      <div className="min-h-screen bg-[#0f0a07] text-white px-6 pt-28 pb-16 lg:px-20">
        <div className="max-w-5xl mx-auto">

          <div className="mb-12">
            <h1 className="text-4xl font-serif italic tracking-wider text-white/90">
              My Orders
            </h1>
            <div className="h-[1px] w-20 bg-[#c8a97e] mt-4"></div>
          </div>

          {loading && (
            <p className="text-white/50 text-sm">Loading orders...</p>
          )}

          {!loading && orders.length === 0 && (
            <div className="bg-[#1a140e]/40 border border-[#c8a97e]/10 p-8 text-center">
              <p className="text-white/60">You have no orders yet.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-[#c8a97e] text-[#1a140e] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em]"
              >
                Continue Shopping
              </button>
            </div>
          )}

          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-[#1a140e]/40 border border-[#c8a97e]/10 p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm uppercase tracking-widest text-[#c8a97e]">
                    {order.orderId}
                  </h2>
                  <span className="text-xs text-white/60">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.description}
                          className="w-16 h-16 object-cover rounded-md border border-[#c8a97e]/20"
                        />
                        <span className="text-white/70">
                          {item.description} × {item.qty}
                        </span>
                      </div>

                      <span className="text-[#e6c89c]">
                        ₹ {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-[1px] bg-[#c8a97e]/20 my-6"></div>

                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-white/40 text-[11px] uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-2xl font-serif italic text-[#e6c89c]">
                    ₹ {order.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="text-sm text-white/70 space-y-1">
                  <p><strong>Name:</strong> {order.customer.name}</p>
                  <p><strong>Email:</strong> {order.customer.email}</p>
                  <p><strong>Phone:</strong> {order.customer.phone}</p>
                  <p><strong>Address:</strong> {order.customer.address}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-[#c8a97e]">
                      {order.status}
                    </span>
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Orders;