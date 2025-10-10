const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

//  Get all products
router.get("/", productController.getAllProducts);

//  Get a single product by slug
router.get("/:slug", productController.getProductBySlug);

//  Create a new product
router.post("/", productController.createProduct);

//  Update a product by slug
router.put("/:slug", productController.updateProduct);

//  Delete a product by slug
router.delete("/:slug", productController.deleteProduct);

module.exports = router;
