import { useEffect, useState, createContext, useContext } from "react";
import axiosInstance from "../../../api/apiInstance";


const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const Cartprovider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/cart");
      setCart(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setCart([]);
      } else {
        console.error("Fetch cart error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD ================= */
 const addToCart = async (product) => {
  const normalizedProduct = {
    ...product,
    id: product._id || product.id,
  };

  // Check if already at limit before doing anything
  const existing = cart.find(
    (item) => String(item.productId) === String(normalizedProduct.id)
  );
  if (existing && existing.qty >= 5) return false; // ← guard

  setCart((prev) => {
    const existing = prev.find(
      (item) => String(item.productId) === String(normalizedProduct.id)
    );
    if (existing) {
      return prev.map((item) =>
        String(item.productId) === String(normalizedProduct.id)
          ? { ...item, qty: Math.min(item.qty + 1, 5) } // ← cap
          : item
      );
    }
    return [
      ...prev,
      {
        productId: normalizedProduct.id,
        description: normalizedProduct.description,
        price: normalizedProduct.price,
        image: Array.isArray(normalizedProduct.images)
          ? normalizedProduct.images[0]
          : normalizedProduct.images,
        qty: 1,
      },
    ];
  });

  try {
    await axiosInstance.post("/cart/add", { product: normalizedProduct });
    return true;
  } catch (err) {
    console.error("Add error:", err);
    fetchCart();
    throw err;
  }
};

  /* ================= INCREASE ================= */
 const increaseQty = async (productId) => {
  const item = cart.find((i) => String(i.productId) === String(productId));
  if (item?.qty >= 5) return; // ← guard

  const prevCart = [...cart];
  setCart((prev) =>
    prev.map((item) =>
      String(item.productId) === String(productId)
        ? { ...item, qty: item.qty + 1 }
        : item
    )
  );
  try {
    await axiosInstance.put("/cart/increase", { productId });
  } catch (err) {
    console.error("Increase error:", err);
    setCart(prevCart);
  }
};

  /* ================= DECREASE ================= */
  const decreaseQty = async (productId) => {
    const prevCart = [...cart];
    setCart((prev) =>
      prev.map((item) => {
        if (String(item.productId) === String(productId)) {
          if (item.qty === 1) return item;
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      })
    );
    try {
      await axiosInstance.put("/cart/decrease", { productId });
    } catch (err) {
      console.error("Decrease error:", err);
      setCart(prevCart);
    }
  };

  /* ================= REMOVE ================= */
  const removeItem = async (productId) => {
    const prevCart = [...cart];
    setCart((prev) =>
      prev.filter((item) => String(item.productId) !== String(productId))
    );
    try {
      await axiosInstance.delete(`/cart/${productId}`);
    } catch (err) {
      console.error("Remove error:", err);
      setCart(prevCart);
    }
  };

  /* ================= CLEAR ================= */
  const clearCart = async () => {
    const prevCart = [...cart];
    setCart([]);
    try {
      await axiosInstance.delete("/cart");
    } catch (err) {
      console.error("Clear error:", err);
      setCart(prevCart);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    fetchCart();
    const handleLogin = () => fetchCart();
    const handleLogout = () => setCart([]);
    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("userLoggedOut", handleLogout);
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, increaseQty, decreaseQty, removeItem, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};