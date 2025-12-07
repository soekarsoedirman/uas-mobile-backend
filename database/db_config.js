require('dotenv').config(); // Load variabel dari file .env
const mysql = require('mysql2/promise');

// Cek apakah env var sudah terbaca (Debugging)
if (!process.env.DB_HOST) {
    console.error("❌ Error: Environment variables belum terbaca. Pastikan file .env ada.");
    process.exit(1);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Default port MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // WAJIB TRUE: Agar bisa menjalankan banyak query sekaligus (untuk file migrasi .sql)
    multipleStatements: true, 
    timezone: '+07:00' // Sesuaikan WIB
});

module.exports = pool;