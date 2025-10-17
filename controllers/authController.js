const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/mailer");

exports.userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save user with OTP and is_verified = 0
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, otp, otp_expires, is_verified, created_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0, NOW())`,
      [name, email, hashedPassword, otp]
    );

    // Send OTP email
    await sendMail({
      to: email,
      subject: "Your Registration OTP",
      otp,
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Verify to complete registration.",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const [users] = await db.query("SELECT * FROM users WHERE email = ? AND otp = ?", [email, otp]);
    if (users.length === 0) return res.status(400).json({ message: "Invalid OTP" });

    const user = users[0];

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP verified → set is_verified = 1 and clear OTP
    await db.query("UPDATE users SET is_verified = 1, otp = NULL, otp_expires = NULL WHERE id = ?", [user.id]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    return res.json({
      message: "Registration successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(400).json({ message: "User not found" });

    const user = users[0];

    if (user.is_verified === 0) {
      return res.status(400).json({ message: "Please verify your email before logging in" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
