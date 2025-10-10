// src/controllers/orderController.js
const db = require("../config/db");

// 🛍️ Create or Update Order Item (User can order a product only once)
exports.createOrder = async (req, res, next) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  try {
    for (const item of items) {
      // 1️⃣ Check if user already has this product in any order
      const [existingItems] = await db.query(
        `SELECT oi.*, o.id AS order_id
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.product_id = ?`,
        [userId, item.product_id]
      );

      if (existingItems.length > 0) {
        // Product exists → update quantity in that order
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + item.quantity;

        await db.query(
          "UPDATE order_items SET quantity = ?, price = ? WHERE id = ?",
          [newQuantity, item.price, existingItem.id]
        );
      } else {
        // Product does not exist → create a new order first
        const [orderResult] = await db.query(
          "INSERT INTO orders (user_id, total) VALUES (?, ?)",
          [userId, item.price * item.quantity]
        );
        const orderId = orderResult.insertId;

        // Insert product into order_items
        await db.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
    }

    res.status(201).json({
      message: "✅ Order processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 📦 Get All Orders for Logged-in User
exports.getMyOrders = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// 🔎 Get Single Order with Items
exports.getOrderById = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name, p.slug, p.brand_name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ ...orders[0], items });
  } catch (error) {
    next(error);
  }
};

// ❌ Cancel/Delete Order
exports.deleteOrder = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [order] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    await db.query("DELETE FROM order_items WHERE order_id = ?", [id]);
    await db.query("DELETE FROM orders WHERE id = ?", [id]);

    res.json({ message: "🗑️ Order cancelled successfully" });
  } catch (error) {
    next(error);
  }
};
