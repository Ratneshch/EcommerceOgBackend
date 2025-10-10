const db = require("../config/db");

// Add a new review
exports.addReview = async (req, res) => {
  const { user_id, product_id, rating, comment } = req.body;

  if (!user_id || !product_id || !rating) {
    return res.status(400).json({ message: "user_id, product_id and rating are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
      [user_id, product_id, rating, comment || ""]
    );

    res.status(201).json({ message: "Review added successfully", reviewId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  const { product_id } = req.params;

  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY created_at DESC`,
      [product_id]
    );

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    await db.query(
      "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
      [rating, comment, id]
    );

    res.json({ message: "Review updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
