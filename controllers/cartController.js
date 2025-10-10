const db = require("../config/db");

// 🛒 Add or Update Cart Item by slug
exports.addToCart = async (req, res, next) => {
  const userId = req.user.id;
  const { slug, quantity = 1 } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Product slug is required" });
  }

  try {
    // Get product ID from slug
    const [products] = await db.query("SELECT id, price FROM products WHERE slug = ?", [slug]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productId = products[0].id;
    const price = products[0].price;

    // Check if product already exists in user's cart
    const [existingItems] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Product exists → update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await db.query(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Product does not exist → insert new
      await db.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
      );
    }

    res.status(200).json({ message: "🛒 Cart updated successfully" });
  } catch (error) {
    next(error);
  }
};

// 📦 Get User Cart with product details
exports.getCart = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.slug, p.price, p.brand_name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
};

// ❌ Remove Item from Cart by slug
exports.removeFromCart = async (req, res, next) => {
  const userId = req.user.id;
  const { slug } = req.params;

  try {
    const [products] = await db.query("SELECT id FROM products WHERE slug = ?", [slug]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productId = products[0].id;

    await db.query(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.status(200).json({ message: "🗑️ Item removed from cart" });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Clear Entire Cart
exports.clearCart = async (req, res, next) => {
  const userId = req.user.id;

  try {
    await db.query("DELETE FROM cart WHERE user_id = ?", [userId]);
    res.status(200).json({ message: "🗑️ Cart cleared successfully" });
  } catch (error) {
    next(error);
  }
};
