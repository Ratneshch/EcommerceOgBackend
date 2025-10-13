const mysql = require('mysql2/promise');

// Create a MySQL pool
const db = mysql.createPool({
    host: 'localhost',        // MySQL host
    user: 'root',             // MySQL username
    password: '',             // MySQL password
    database: 'ecommerceog',  // Your database name
    port: 3306,               // Default MySQL port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000     // 10 seconds timeout
});

// Test connection on startup
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Successfully connected to the database");
        connection.release(); // Release back to the pool
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1); // Exit app if DB connection fails
    }
})();

module.exports = db;
