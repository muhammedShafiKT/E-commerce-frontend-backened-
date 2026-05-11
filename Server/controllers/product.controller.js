import Product from "../models/Products.js";
import { resolveOffer } from "./offer.controller.js";

const enrichProduct = async (product) => {
  const p     = product.toObject ? product.toObject() : product;
  const offer = await resolveOffer(product);

  if (offer && offer.type !== "bogo" && offer.discountPercent > 0) {
    const savings    = Math.round((p.price * offer.discountPercent) / 100);
    const finalPrice = Math.round(p.price - savings);
    return {
      ...p,
      offer: {
        name:            offer.title || offer.name || null,   // FIX: DB uses "title"
        type:            offer.type,
        discountPercent: offer.discountPercent,
        bogoConfig:      offer.bogoConfig ?? null,
      },
      finalPrice,
      savings,
    };
  }

  if (offer && offer.type === "bogo") {
    return {
      ...p,
      offer: {
        name:       offer.title || offer.name || null,        // FIX: DB uses "title"
        type:       offer.type,
        bogoConfig: offer.bogoConfig ?? null,
      },
      finalPrice: p.price,
      savings:    0,
    };
  }

  return { ...p, offer: null, finalPrice: p.price, savings: 0 };
};


export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};
    if (search)   query.name     = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const sortOption =
      sort === "asc"  ? { price:  1 } :
      sort === "desc" ? { price: -1 } : {};

    const products = await Product.find(query).sort(sortOption);
    const enriched = await Promise.all(products.map(enrichProduct));

    res.json(enriched);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const allproducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    const product = new Product({
      name:        req.body.name,
      description: req.body.description,
      price:       Number(req.body.price),
      category:    req.body.category,
      brand:       req.body.brand,
      stock:       Number(req.body.stock),
      images:      [imageUrl],
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      updateData.images = [req.file.path];
    }
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const enriched = await enrichProduct(product);
    res.json(enriched);
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isHidden = !product.isHidden;
    await product.save();

    res.json({
      message:  `Product ${product.isHidden ? "hidden" : "visible"}`,
      isHidden: product.isHidden,
    });
  } catch {
    res.status(500).json({ message: "Toggle failed" });
  }
};