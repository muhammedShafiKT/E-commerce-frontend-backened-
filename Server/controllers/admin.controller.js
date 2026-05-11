import User from "../models/User.js";
import Product from "../models/Products.js";
import Order from "../models/Order.js";
// import orders from "razorpay/dist/types/orders.js";

// GET /api/admin/stats
// Returns: user count, order count, product count, total revenue
export const getAdminStats = async (req, res) => {
  try {
    const [userCount, productCount, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const { totalOrders = 0, totalRevenue = 0 } = revenueAgg[0] || {};

    res.json({
      users: userCount,
      orders: totalOrders,
      products: productCount,
      totalRevenue,
    });
  } catch (err) {
    console.error("getAdminStats error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};


export const getRevenueChart = async (req, res) => {
  try {
    const days = parseInt(req.query.range) === 7 ? 7 : 30;

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const raw = await Order.aggregate([
      // Only orders within the requested window
      { $match: { createdAt: { $gte: since } } },

     
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
        },
      },

      { $sort: { _id: 1 } },
    ]);

   
    const revenueByDate = Object.fromEntries(
      raw.map(({ _id, revenue }) => [_id, revenue])
    );

    const chart = Array.from({ length: days }, (_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const date = d.toISOString().split("T")[0];
      return { date, revenue: revenueByDate[date] || 0 };
    });

    res.json(chart);
  } catch (err) {
    console.error("getRevenueChart error:", err);
    res.status(500).json({ message: "Failed to fetch revenue chart" });
  }
};