const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { validateRequest, protect } = require("../middleware/authMiddleware");

// ✅ Register route with validation
router.post(
  "/register",
  validateRequest(["name", "email", "password"]),
  registerUser
);

// ✅ Login route with validation
router.post(
  "/login",
  validateRequest(["email", "password"]),
  loginUser
);

// ✅ Example protected route
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

module.exports = router;
