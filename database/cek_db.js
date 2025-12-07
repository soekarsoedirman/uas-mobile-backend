const pool = require('./db_config');

async function checkDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('\n--- 🔍 MEMERIKSA SELURUH DATA DATABASE ---');

        // Daftar semua tabel yang ingin dicek
        const tables = [
            'role', 
            'kategori', 
            'user', 
            'product', 
            'keranjang', 
            'pembelian'
        ];

        for (const tableName of tables) {
            // Query ambil semua data
            const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
            
            console.log(`\n📂 Tabel: ${tableName.toUpperCase()}`);
            
            if (rows.length > 0) {
                // Tampilkan data jika ada
                console.table(rows);
            } else {
                // Beri info jika kosong
                console.log('   ⚠️  (Tabel ini masih kosong / belum ada data)');
            }
        }

        console.log('\n--- 🔍 CEK STRUKTUR TABEL PRODUCT ---');
        // Pastikan kolom foto ada (karena penting untuk S3)
        const [columns] = await connection.query('SHOW COLUMNS FROM product');
        const kolomFoto = columns.find(col => col.Field === 'foto');
        
        if (kolomFoto) {
            console.log('✅ Struktur Valid: Kolom FOTO ditemukan.');
        } else {
            console.error('❌ WARNING: Kolom FOTO hilang!');
        }

    } catch (error) {
        console.error('❌ Error saat pengecekan:', error);
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

checkDatabase();