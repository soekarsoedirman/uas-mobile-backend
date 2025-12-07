const pool = require('./db_config'); // Import pool langsung, bukan createConnection

async function runSeed() {
    let connection;
    try {
        console.log('🔄 Menghubungkan ke Database untuk Seeding...');
        // Ambil koneksi dari pool
        connection = await pool.getConnection();

        console.log('🌱 Mulai mengisi data awal (Seeding)...');

        // 1. Seed ROLE
        const roleSql = `
            INSERT INTO role (roleID, rolename) VALUES 
            (1, 'User'),
            (2, 'Penjual')
            ON DUPLICATE KEY UPDATE rolename=VALUES(rolename);
        `;
        await connection.query(roleSql);
        console.log('✅ Data Role berhasil diisi.');

        // 2. Seed KATEGORI
        const kategoriSql = `
            INSERT INTO kategori (kategoriID, kategoriName) VALUES 
            (1, 'Pakaian'),
            (2, 'Olahraga'),
            (3, 'Makanan'),
            (4, 'Elektronik'),
            (5, 'Rumah Tangga')
            ON DUPLICATE KEY UPDATE kategoriName=VALUES(kategoriName);
        `;
        await connection.query(kategoriSql);
        console.log('✅ Data Kategori berhasil diisi.');

        console.log('🎉 SEEDING SELESAI!');

    } catch (error) {
        console.error('❌ SEEDING GAGAL:', error);
    } finally {
        if (connection) connection.release(); // Lepas koneksi
        // Tutup pool hanya jika script ini dijalankan sendirian (bukan di-import)
        if (require.main === module) {
            await pool.end();
            process.exit(0);
        }
    }
}

// Jalankan fungsi jika file ini dipanggil langsung "node seed.js"
if (require.main === module) {
    runSeed();
}

module.exports = runSeed;