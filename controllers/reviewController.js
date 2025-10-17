const db = require('../config/db');

// Add review
exports.addReview = async (req, res) => {
    try {
        const { productId, userId, rating, comment } = req.body;
        if (!productId || !userId || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Insert review
        const [result] = await db.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
            [productId, userId, rating, comment || null]
        );

        // Update average rating in products
        const [avg] = await db.query(
            `SELECT AVG(rating) as avgRating FROM reviews WHERE product_id = ?`,
            [productId]
        );
        await db.query(`UPDATE products SET rating = ? WHERE id = ?`, [avg[0].avgRating, productId]);

        res.json({ message: "Review added successfully", reviewId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get reviews for a product


exports.getProductReview = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        console.log("Fetching reviews for Product ID:", productId);

        // Use correct user column: 'username' or 'name'
        const [reviews] = await db.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, u.name as userName
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?`,
            [productId]
        );

        console.log("Reviews fetched:", reviews);

        if (reviews.length === 0) {
            return res.json({ message: "No reviews found for this product", reviews: [] });
        }

        res.json(reviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Update review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        await db.query(
            `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
            [rating, comment, id]
        );
        res.json({ message: "Review updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM reviews WHERE id = ?`, [id]);
        res.json({ message: "Review deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
