import { useEffect, useState, createContext, useContext } from "react";
import axiosInstance from "../../../api/apiInstance";


const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await axiosInstance.get("/wishlist");
      setWishlist(res.data);
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    }
  };

  const addToWishlist = async (product) => {
    try {
      await axiosInstance.post("/wishlist/add", { product });
      fetchWishlist();
      return { success: true };
    } catch (err) {
      console.error("Add wishlist error:", err);
      return { success: false, message: "failed to add" };
    }
  };

  const removeItemFromWishlist = async (productId) => {
    try {
      await axiosInstance.delete(`/wishlist/${productId}`);
      fetchWishlist();
    } catch (err) {
      console.error("Remove wishlist error:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeItemFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};