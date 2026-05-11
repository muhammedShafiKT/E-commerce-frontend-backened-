import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import { resolveOffer } from "./offer.controller.js";

const getFinalPrice = async (productId, fallbackPrice) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return { finalPrice: fallbackPrice, originalPrice: fallbackPrice, discountPercent: 0 };
    const offer = await resolveOffer(product);
    if (offer && offer.type !== "bogo" && offer.discountPercent > 0) {
      const finalPrice = Math.round((product.price - (product.price * offer.discountPercent) / 100) * 100) / 100;
      return { finalPrice, originalPrice: product.price, discountPercent: offer.discountPercent };
    }
    return { finalPrice: product.price, originalPrice: product.price, discountPercent: 0 };
  } catch {
    return { finalPrice: fallbackPrice, originalPrice: fallbackPrice, discountPercent: 0 };
  }
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).lean();
  return res.json(cart?.items || []);
};

export const addToCart = async (req, res) => {
  const { product } = req.body;
  if (!product?.id) return res.status(400).json({ message: "Invalid product data" });

  try {
    const { finalPrice, originalPrice, discountPercent } = await getFinalPrice(product.id, product.price);

    // Step 1: increment if exists
    const updated = await Cart.findOneAndUpdate(
      { userId: req.user.id, "items.productId": product.id },
      {
        $inc: { "items.$.qty": 1 },
        $set: {
          "items.$.price": finalPrice,
          "items.$.originalPrice": originalPrice,
          "items.$.discountPercent": discountPercent,
        },
      },
      { new: true }
    );

    if (updated) return res.json(updated.items);

    // Step 2: push new item
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      {
        $push: {
          items: {
            productId: product.id,
            description: product.description,
            price: finalPrice,
            originalPrice,        // ← add
            discountPercent,      // ← add
            image: Array.isArray(product.images) ? product.images[0] : product.images,
            qty: 1,
          },
        },
      },
      { new: true, upsert: true }
    );

    res.json(cart.items);
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

export const increaseQty = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "productId required" });
  try {
    await Cart.updateOne(
      { userId: req.user.id, "items.productId": productId },
      { $inc: { "items.$.qty": 1 } }
    );
    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    res.json(cart?.items || []);
  } catch (err) {
    console.error("INCREASE QTY ERROR:", err);
    res.status(500).json({ message: "Error increasing quantity" });
  }
};

export const decreaseQty = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "productId required" });
  try {
    await Cart.updateOne(
      { userId: req.user.id, "items.productId": productId, "items.qty": { $gt: 1 } },
      { $inc: { "items.$.qty": -1 } }
    );
    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    res.json(cart?.items || []);
  } catch (err) {
    console.error("DECREASE QTY ERROR:", err);
    res.status(500).json({ message: "Error decreasing quantity" });
  }
};

export const removeItem = async (req, res) => {
  const { productId } = req.params;
  if (!productId) return res.status(400).json({ message: "productId required" });
  try {
    await Cart.updateOne({ userId: req.user.id }, { $pull: { items: { productId } } });
    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    res.json(cart?.items || []);
  } catch (err) {
    console.error("REMOVE ITEM ERROR:", err);
    res.status(500).json({ message: "Error removing item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.updateOne({ userId: req.user.id }, { $set: { items: [] } });
    res.json([]);
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    res.status(500).json({ message: "Error clearing cart" });
  }
};