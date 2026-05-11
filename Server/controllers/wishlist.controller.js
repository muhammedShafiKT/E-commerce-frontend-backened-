import Wishlist from "../models/Wishlist.js";

// GET
export const getWishlist = async (req, res) => {
  try {
    const doc = await Wishlist.findOne({ userId: req.user.id });
    res.json(doc ? doc.items : []);
  } catch {
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};

// ADD
export const addToWishlist = async (req, res) => {
  const { product } = req.body;

  try {
    const productId = product._id || product.id;

    // Find or create the wishlist document for this user
    let doc = await Wishlist.findOne({ userId: req.user.id });

    if (!doc) {
      doc = new Wishlist({ userId: req.user.id, items: [] });
    }

    const exists = doc.items.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (exists) return res.json(doc.items);

    doc.items.push({
      productId,
      description: product.description,
      price: product.price,
      images: Array.isArray(product.images) ? product.images[0] : product.images,
    });

    await doc.save();
    res.json(doc.items);
  } catch {
    res.status(500).json({ message: "Error adding to wishlist" });
  }
};

// REMOVE
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    const doc = await Wishlist.findOne({ userId: req.user.id });

    if (!doc) return res.json([]);

    doc.items = doc.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await doc.save();
    res.json(doc.items);
  } catch {
    res.status(500).json({ message: "Error removing from wishlist" });
  }
};