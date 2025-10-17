const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Add a new review
router.post('/', reviewController.addReview);

// Get all reviews for a product
router.get('/product/:productId', reviewController.getProductReview);

// Update a review
router.put('/:id', reviewController.updateReview);

// Delete a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
