const fs = require('fs');
const path = require('path');
const pool = require('./db_config'); // Import pool

async function runMigration() {
    let connection;
    try {
        console.log('🔄 Mengambil koneksi dari Pool...');
        // Ambil 1 koneksi khusus dari pool untuk proses ini
        connection = await pool.getConnection(); 

        const sqlPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Menjalankan migrasi schema...');
        
        // Eksekusi file SQL
        await connection.query(sql);

        console.log('✅ Migrasi BERHASIL! Tabel telah dibuat/direset.');

    } catch (error) {
        console.error('❌ Migrasi GAGAL:', error);
    } finally {
        if (connection) connection.release(); // Kembalikan koneksi ke pool
        await pool.end(); // Tutup pool agar script berhenti (exit)
    }
}

runMigration();