const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Add or update cart item
router.post("/", protect, addToCart);   

// Get user cart
router.get("/", protect, getCart);

// Remove single item from cart by slug
router.delete("/:slug", protect, removeFromCart);

// Clear entire cart
router.delete("/", protect, clearCart);

module.exports = router;
