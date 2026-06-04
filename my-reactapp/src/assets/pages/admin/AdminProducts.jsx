import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/apiInstance";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("add");
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    brand: "",
    description: "",
    imageFile: null,
  });

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/products/admin/all");
      setProducts(res.data);
    } catch (err) {
      console.log("fetch error:", err.response?.status, err.response?.data);
      toast.error("Failed to load inventory");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, imageFile: file }));
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      brand: "",
      description: "",
      imageFile: null,
    });
    setPreview(null);
    setMode("add");
    setEditingId(null);
  };

  const addProduct = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", Number(form.price));
    formData.append("stock", Number(form.stock));
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    formData.append("image", form.imageFile);

    try {
      await axiosInstance.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Piece added to collection");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch {
      toast.error("Upload failed. Check server connection.");
    }
  };

  const updateProduct = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", Number(form.price));
    formData.append("stock", Number(form.stock));
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }

    try {
      await axiosInstance.put(`/products/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch {
      toast.error("Update failed. Check server connection.");
    }
  };

  const startEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      brand: product.brand || "",
      description: product.description || "",
      imageFile: null,
    });
    setPreview(Array.isArray(product.images) ? product.images[0] : product.images);
    setEditingId(product._id);
    setMode("edit");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Archive this item?")) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        toast.success("Item removed");
        fetchProducts();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const toggleVisibility = async (id, currentHidden) => {
    try {
      await axiosInstance.patch(`/products/${id}/toggle-visibility`);
      toast.success(currentHidden ? "Product is now visible" : "Product hidden from store");
      fetchProducts();
    } catch {
      toast.error("Visibility toggle failed");
    }
  };

  const filteredProducts =
    category === "all"
      ? products
      : products.filter(p => p.category.toLowerCase() === category.toLowerCase());

  const isInvalid =
    !form.name.trim() ||
    !form.category.trim() ||
    !form.price ||
    !form.stock ||
    (mode === "add" && !form.imageFile);

  return (
    <div className="space-y-10 pb-20 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-serif italic text-white underline decoration-[#c8a97e]/30 underline-offset-8">
          Product Management
        </h3>
        <button
          onClick={() => {
            setShowForm(v => !v);
            if (!showForm) resetForm();
          }}
          className="w-full sm:w-auto px-6 py-3 border border-[#c8a97e]/30 text-[#c8a97e] text-[10px] uppercase tracking-[0.2em] hover:bg-[#c8a97e]/5 transition-colors"
        >
          {showForm ? "Cancel Operation" : "Add New Piece"}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <section className="bg-[#1a140e]/60 border border-[#c8a97e]/10 p-6 lg:p-8 rounded-sm animate-in fade-in duration-500">
          <h3 className="text-lg font-serif italic mb-8 text-[#c8a97e]">
            {mode === "add" ? "New Inventory Registration" : `Editing: ${form.name}`}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="name" placeholder="Piece Name" value={form.name} onChange={handleChange} className="admin-input sm:col-span-2" />
              <input name="brand" placeholder="Brand/Designer" value={form.brand} onChange={handleChange} className="admin-input" />
              <select name="category" value={form.category} onChange={handleChange} className="admin-input">
                <option value="">Select Category</option>
                <option value="chairs">CHAIRS</option>
                <option value="storage">STORAGE</option>
                <option value="decor">DECOR</option>
                <option value="sofa">SOFA</option>
              </select>
              <input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="admin-input" />
              <input name="stock" type="number" placeholder="Stock Units" value={form.stock} onChange={handleChange} className="admin-input" />

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-[#c8a97e]/60">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="admin-input"
                />
              </div>

              <textarea
                name="description"
                placeholder="Short Narrative/Description"
                value={form.description}
                onChange={handleChange}
                className="admin-input sm:col-span-2 h-24 pt-3 resize-none"
              />
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div className="border border-[#c8a97e]/10 bg-white/5 p-2 aspect-[4/5] flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase tracking-tighter opacity-20 text-white">No Preview Available</span>
                )}
              </div>
              <button
                onClick={mode === "add" ? addProduct : updateProduct}
                disabled={isInvalid}
                className={`w-full h-14 uppercase tracking-widest text-[10px] transition-all ${
                  mode === "add" ? "bg-[#c8a97e] text-[#0f0a07]" : "bg-white text-black"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {mode === "add" ? "Confirm Entry" : "Save Updates"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Inventory Table Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#c8a97e]/10 pb-4 gap-4">
          <h3 className="text-lg font-serif italic text-white">Live Inventory</h3>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-transparent border-none text-[#c8a97e] text-xs uppercase tracking-widest outline-none cursor-pointer"
          >
            <option value="all">Display All Collections</option>
            <option value="chairs">Chairs</option>
            <option value="decor">Decor</option>
            <option value="storage">Storage</option>
            <option value="sofa">Sofa</option>
          </select>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-[#c8a97e]/40 border-b border-[#c8a97e]/10">
              <tr>
                <th className="py-4 px-2">Visual</th>
                <th className="py-4 px-2">Identification</th>
                <th className="py-4 px-2">Category</th>
                <th className="py-4 px-2">Valuation</th>
                <th className="py-4 px-2">Stock</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-white">
              {filteredProducts.map(p => (
                <tr
                  key={p._id}
                  className={`border-b border-[#c8a97e]/5 transition-colors group ${
                    p.isHidden ? "opacity-40 hover:opacity-70" : "hover:bg-[#c8a97e]/5"
                  }`}
                >
                  <td className="py-4 px-2">
                    <img
                      src={Array.isArray(p.images) ? p.images[0] : p.images}
                      className="w-10 h-12 object-cover transition-all"
                      alt={p.name}
                    />
                  </td>
                  <td className="py-4 px-2">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-[10px] text-[#c8a97e]/40 uppercase tracking-tighter">{p.brand}</p>
                  </td>
                  <td className="py-4 px-2 uppercase text-[10px] tracking-widest">{p.category}</td>
                  <td className="py-4 px-2">₹{p.price.toLocaleString()}</td>
                  <td className="py-4 px-2">
                    <span className={`text-[10px] ${p.stock < 5 ? "text-rose-500 font-bold" : "text-[#c8a97e]/60"}`}>
                      {p.stock} Units
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`text-[10px] uppercase tracking-widest ${
                      p.isHidden ? "text-rose-400" : "text-emerald-400"
                    }`}>
                      {p.isHidden ? "Hidden" : "Live"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right space-x-4">
                    <button
                      onClick={() => startEdit(p)}
                      className="hover:text-white transition-colors text-[10px] uppercase text-[#c8a97e]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleVisibility(p._id, p.isHidden)}
                      className={`text-[10px] uppercase transition-colors ${
                        p.isHidden
                          ? "text-emerald-600 hover:text-emerald-400"
                          : "text-yellow-700 hover:text-yellow-500"
                      }`}
                    >
                      {p.isHidden ? "Unhide" : "Hide"}
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="text-rose-900 hover:text-rose-500 transition-colors text-[10px] uppercase"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-[#c8a97e]/30 text-xs uppercase tracking-widest py-10">
            No products found
          </p>
        )}
      </section>

      <style>{`
        .admin-input {
          background: rgba(200, 169, 126, 0.05);
          border: 1px solid rgba(200, 169, 126, 0.15);
          color: #e6c89c;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          width: 100%;
          outline: none;
          transition: all 0.3s ease;
        }
        .admin-input:focus {
          border-color: #c8a97e;
          background: rgba(200, 169, 126, 0.1);
        }
        select.admin-input option {
          background: #1a140e;
          color: #e6c89c;
        }
      `}</style>
    </div>
  );
}