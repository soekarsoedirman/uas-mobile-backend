const mysql = require('mysql2/promise');

// Sebaiknya gunakan Environment Variables (dotenv)
const pool = mysql.createPool({
    host: process.env.DB_HOST,      // Endpoint RDS tadi
    user: process.env.DB_USER,      // Username master RDS (biasanya 'admin')
    password: process.env.DB_PASSWORD, // Password saat buat RDS
    database: process.env.DB_NAME,  // Nama database awal
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;