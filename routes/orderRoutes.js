// src/routes/orderRoutes.js
const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  deleteOrder,
} = require("../controllers/orderController");

const { protect, validateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

// 🛍️ Create Order - validate required fields
router.post(
  "/",
  protect,
  validateRequest(["total", "items"]), // ensure total and items are sent
  createOrder
);

// 📦 Get all orders of the logged-in user
router.get("/", protect, getMyOrders);

// 🔎 Get single order details
router.get("/:id", protect, getOrderById);

// ❌ Cancel/Delete an order
router.delete("/:id", protect, deleteOrder);

module.exports = router;
