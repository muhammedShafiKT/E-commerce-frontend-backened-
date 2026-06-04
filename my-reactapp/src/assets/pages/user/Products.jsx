import { useEffect, useState } from "react";
import axiosInstance from "../../../api/apiInstance.js";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useCart } from "./Cartprovider";
import { useWishlist } from "./Wishlistprovider";
import toast from "react-hot-toast";

/**
 * Premium Golden Corner Label
 * Zero margin, high metallic gold shade, thin font.
 */
function GoldenOfferBadge({ product }) {
  const { offer } = product;
  if (!offer || !offer.name) return null;

  return (
    <div className="absolute top-0 left-0 z-30 pointer-events-none">
      {/* Sharp Rectangle with Glassmorphism */}
      <div 
        className="relative py-2.5 px-5 backdrop-blur-md border-r border-b border-[#c8a97e]/10"
        style={{
          background: "rgba(10, 7, 5, 0.8)", // Matches the deep dark tone of your site
        }}
      >
        <div className="flex items-center gap-3">
          {/* Minimalist vertical gold accent line */}
          <div className="w-[1px] h-3 bg-[#c8a97e]"></div>
          
          <span className="text-[#c8a97e] text-[9px] font-bold tracking-[0.5em] uppercase whitespace-nowrap leading-none">
            {offer.name}
          </span>
        </div>

        {/* Very subtle bottom highlight for premium depth */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#c8a97e]/40 to-transparent"></div>
      </div>
    </div>
  );
}

function ShimmerCard() {
  return (
    <div className="flex flex-col bg-transparent">
      <div className="shimmer relative aspect-[4/5] border border-[#c8a97e]/5" />
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="shimmer h-5 w-32 rounded-sm" />
          <div className="shimmer h-5 w-16 rounded-sm" />
        </div>
        <div className="pt-4 border-t border-[#c8a97e]/10 flex justify-between">
          <div className="shimmer h-3 w-12 rounded-sm" />
          <div className="shimmer h-3 w-20 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

function CardPrice({ product }) {
  const { offer, finalPrice, price } = product;

  if (!offer || offer.type === "bogo" || !offer.discountPercent) {
    return <p className="text-[#e6c89c] text-sm">₹{price.toLocaleString()}</p>;
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <p className="text-[#e6c89c] text-sm">₹{finalPrice.toLocaleString()}</p>
      <p className="text-white/25 text-[11px] line-through">₹{price.toLocaleString()}</p>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const location = useLocation();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeItemFromWishlist } = useWishlist();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = (searchParams.get("search") || "").trim();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (sortOrder !== "none") params.sort = sortOrder;

        const res = await axiosInstance.get("/products", { params });
        const productsArray = Array.isArray(res.data) ? res.data : res.data.products || [];
        const updated = productsArray.map((p) => ({ ...p, id: p._id }));
        
        setProducts(updated);

        if (!searchQuery && selectedCategory === "all" && sortOrder === "none") {
          const unique = ["all", ...new Set(updated.map((p) => p.category))];
          setCategories(unique);
        }
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, sortOrder]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, sortOrder]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  return (
    <div className="overflow-y-auto h-screen bg-[#0f0a07]">
      <Navbar />

      <div className="px-8 py-16">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-[10px] tracking-[0.6em] text-[#c8a97e] uppercase mb-4 opacity-80">
            {searchQuery ? `Searching for: "${searchQuery}"` : "The Autumn Collection"}
          </p>
          <h2 className="text-5xl font-serif text-white italic tracking-widest">Products</h2>
          <div className="h-[1px] w-24 bg-[#c8a97e]/20 mx-auto mt-8" />
        </div>

        {/* Filter / Sort */}
        <div className="flex justify-between max-w-7xl mx-auto mb-10">
          <select
            className="bg-[#0f0a07] text-[#c8a97e] border border-[#c8a97e]/20 p-2 text-sm focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>

          <select
            className="bg-[#0f0a07] text-[#c8a97e] border border-[#c8a97e]/20 p-2 text-sm focus:outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="none">Sort by price</option>
            <option value="asc">Low → High</option>
            <option value="desc">High → Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid gap-x-8 gap-y-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => <ShimmerCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-[#c8a97e] uppercase tracking-widest text-sm py-20">
            No products found
          </div>
        ) : (
          <>
            <div className="grid gap-x-8 gap-y-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
              {currentProducts.map((product) => {
                const isWishlisted = wishlist.some((item) => item.productId === product.id);

                return (
                  <div key={product.id} className="group flex flex-col bg-transparent relative">
                    <div className="relative overflow-hidden aspect-[4/5] bg-[#1a140e]/40 border border-[#c8a97e]/5">
                      
                      {/* GOLDEN TITLE BADGE - NO MARGIN */}
                      <GoldenOfferBadge product={product} />

                      {/* Wishlist button */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (isWishlisted) {
                            await removeItemFromWishlist(product.id);
                            toast.error("Removed from wishlist");
                          } else {
                            const res = await addToWishlist(product);
                            if (res.success) toast.success("Saved to wishlist");
                          }
                        }}
                        className={`absolute top-4 right-4 z-20 p-2 backdrop-blur-md border transition-all duration-300 ${
                          isWishlisted
                            ? "bg-[#c8a97e] text-[#0f0a07] border-[#c8a97e]"
                            : "bg-[#0f0a07]/40 text-[#c8a97e] border-[#c8a97e]/20 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 12-12Z" />
                        </svg>
                      </button>

                      <Link to={`/productsUI/${product.id}`} className="block h-full">
                        <img
                          src={Array.isArray(product.images) ? product.images[0] : product.images}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        />
                      </Link>
                    </div>

                    <div className="mt-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="text-white font-serif text-lg italic line-clamp-1 flex-1">
                          {product.name}
                        </h3>
                        <CardPrice product={product} />
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#c8a97e]/10">
                        <p className={`text-[9px] uppercase tracking-widest font-bold ${product.stock > 0 ? "text-[#c8a97e]" : "text-rose-800"}`}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </p>
                        <button
                          onClick={async () => {
                            const success = await addToCart(product);
                            if (success) toast.success("Added to cart");
                          }}
                          disabled={product.stock === 0}
                          className="text-[10px] uppercase tracking-[0.2em] text-white hover:text-[#c8a97e] transition-colors disabled:text-white/10"
                        >
                          [ Add to Cart ]
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-[#c8a97e] text-[10px] uppercase tracking-widest disabled:opacity-20 px-4 py-2 border border-[#c8a97e]/20"
                >
                  Prev
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 text-[10px] flex items-center justify-center border transition-all ${
                        currentPage === i + 1
                          ? "bg-[#c8a97e] text-[#0f0a07] border-[#c8a97e]"
                          : "text-[#c8a97e] border-[#c8a97e]/20"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-[#c8a97e] text-[10px] uppercase tracking-widest disabled:opacity-20 px-4 py-2 border border-[#c8a97e]/20"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Products;