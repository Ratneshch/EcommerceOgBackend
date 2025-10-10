const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ Register User
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Check if user already exists
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Insert new user
    await db.query(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
};

// ✅ Login User
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!user.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Use JWT_EXPIRES_IN from .env
    const token = jwt.sign(
      { id: user[0].id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
};
