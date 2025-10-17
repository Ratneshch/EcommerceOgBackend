

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");




router.post("/register", authController.userRegister);
router.post("/verify-otp",authController.verifyOTP);
router.post("/login", authController.login);

module.exports = router;