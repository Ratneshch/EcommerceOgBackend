const db = require("../config/db");

// Add a new address
exports.addAddress = async (req, res) => {
  const { user_id, fullName, address, city, state, country, pincode, phoneNumber, type } = req.body;

  if (!user_id || !fullName || !address || !city || !state || !country || !pincode || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO addresses 
      (user_id, fullName, address, city, state, country, pincode, phoneNumber, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, fullName, address, city, state, country, pincode, phoneNumber, type || 'Home']
    );

    res.status(201).json({ message: "Address added successfully", addressId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all addresses for a user
exports.getUserAddresses = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [addresses] = await db.query("SELECT * FROM addresses WHERE user_id = ?", [user_id]);
    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single address by ID
exports.getAddressById = async (req, res) => {
  const { id } = req.params;

  try {
    const [address] = await db.query("SELECT * FROM addresses WHERE id = ?", [id]);

    if (!address.length) return res.status(404).json({ message: "Address not found" });

    res.json(address[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  const { id } = req.params;
  const { fullName, address, city, state, country, pincode, phoneNumber, type } = req.body;

  try {
    await db.query(
      `UPDATE addresses SET 
        fullName = ?, address = ?, city = ?, state = ?, country = ?, 
        pincode = ?, phoneNumber = ?, type = ?
       WHERE id = ?`,
      [fullName, address, city, state, country, pincode, phoneNumber, type || 'Home', id]
    );

    res.json({ message: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM addresses WHERE id = ?", [id]);
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
