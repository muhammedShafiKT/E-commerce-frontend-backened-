import Offer from "../models/Offer.js";
import Product from "../models/Products.js"

/* ── helper: compute best offer for a product ── */
export const resolveOffer = async (product) => {
  const now = new Date();

  const offers = await Offer.find({
    active: true,
    $or: [
      { type: "product",  productId: product._id },
      { type: "flash",    productId: product._id },
      { type: "category", category: product.category },
      { type: "bogo" },
    ],
  });

  const valid = offers.filter((o) => {
    if (o.type === "flash") {
      if (o.startDate && now < o.startDate) return false;
      if (o.endDate   && now > o.endDate)   return false;
    }
    return true;
  });

  if (!valid.length) return null;

  const best = valid.reduce((prev, cur) => {
    const pd = prev.discountPercent ?? 0;
    const cd = cur.discountPercent  ?? 0;
    return cd > pd ? cur : prev;
  });

  return best;
};

/* ── helper: normalize offer shape (title -> name) ── */
const normalizeOffer = (offer) => ({
  name:            offer.title || offer.name || null,   // FIX: DB uses "title" field
  type:            offer.type,
  discountPercent: offer.discountPercent ?? 0,
  bogoConfig:      offer.bogoConfig ?? null,
});

/* ── GET /offers  — all offers (admin) ── */
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("productId", "name price images")
      .sort({ _id: -1 });
    res.json(offers);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch offers" });
  }
};

/* ── POST /offers/create ── */
export const createOffer = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.productId) body.productId = null;
    if (!body.category || body.category.trim() === "") body.category = null;

    const offer = await Offer.create(body);
    res.status(201).json(offer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || "Failed to create offer" });
  }
};

/* ── PATCH /offers/edit/:id ── */
export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  } catch (e) {
    res.status(500).json({ message: "Failed to update offer" });
  }
};

/* ── DELETE /offers/delete/:id ── */
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete offer" });
  }
};

/* ── GET /offers/product/:productId  — called by product detail page ── */
export const getOfferForProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const offer = await resolveOffer(product);
    if (!offer) return res.json(null);

    let finalPrice = product.price;
    let savings    = 0;

    if (offer.type !== "bogo" && offer.discountPercent > 0) {
      savings    = (product.price * offer.discountPercent) / 100;
      finalPrice = product.price - savings;
    }

    res.json({
      offer:         normalizeOffer(offer),
      originalPrice: product.price,
      finalPrice:    Math.round(finalPrice),
      savings:       Math.round(savings),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to resolve offer" });
  }
};