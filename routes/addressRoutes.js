const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// Add a new address
router.post("/", addressController.addAddress);

// Get all addresses for a user
router.get("/user/:user_id", addressController.getUserAddresses);

// Get single address by ID
router.get("/:id", addressController.getAddressById);

// Update an address
router.put("/:id", addressController.updateAddress);

// Delete an address
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
