const pool = require('./db_config');

async function checkDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('\n--- 🔍 MEMERIKSA DATABASE ---');

        // 1. Cek Tabel Role
        const [roles] = await connection.query('SELECT * FROM role');
        console.log('\n📂 Data Role:');
        console.table(roles);

        // 2. Cek Tabel Kategori
        const [kategori] = await connection.query('SELECT * FROM kategori');
        console.log('\n📂 Data Kategori:');
        console.table(kategori);

        // 3. Cek Struktur Tabel Product (Memastikan kolom foto ada)
        const [columns] = await connection.query('SHOW COLUMNS FROM product');
        const kolomFoto = columns.find(col => col.Field === 'foto');
        
        if (kolomFoto) {
            console.log('\n✅ Tabel Product Valid (Kolom FOTO ditemukan)');
        } else {
            console.error('\n❌ WARNING: Kolom FOTO tidak ditemukan di tabel Product!');
        }

    } catch (error) {
        console.error('❌ Error saat pengecekan:', error);
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

checkDatabase();