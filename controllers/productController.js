const db = require("../config/db");

// ✅ Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    const formattedProducts = products.map(p => ({
      ...p,
      image_urls: p.image_urls ? JSON.parse(p.image_urls) : []
    }));
    res.json(formattedProducts);
  } catch (err) {
    next(err);
  }
};

// ✅ Get product by slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const [product] = await db.query("SELECT * FROM products WHERE slug = ?", [slug]);

    if (!product.length) return res.status(404).json({ message: "Product not found" });

    res.json({
      ...product[0],
      image_urls: product[0].image_urls ? JSON.parse(product[0].image_urls) : []
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, slug, description, price, sale_price, rating, category, brand_name, image_urls } = req.body;
    const imagesJson = JSON.stringify(image_urls || []);

    await db.query(
      `INSERT INTO products (name, slug, description, price, sale_price, rating, category, brand_name, image_urls, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, slug, description, price, sale_price, rating, category, brand_name, imagesJson]
    );

    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    next(err);
  }
};

// ✅ Update product by slug
exports.updateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name, description, price, sale_price, rating, category, brand_name, image_urls } = req.body;
    const imagesJson = image_urls ? JSON.stringify(image_urls) : null;

    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, sale_price = ?, rating = ?, category = ?, brand_name = ?, image_urls = ?
       WHERE slug = ?`,
      [name, description, price, sale_price, rating, category, brand_name, imagesJson, slug]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    next(err);
  }
};

// ✅ Delete product by slug
exports.deleteProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [result] = await db.query("DELETE FROM products WHERE slug = ?", [slug]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};
