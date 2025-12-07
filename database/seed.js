const { createConnection } = require('./db_config');

async function runSeed() {
    let connection;
    try {
        console.log('🔄 Menghubungkan ke Database untuk Seeding...');
        connection = await createConnection();

        console.log('🌱 Mulai mengisi data awal (Seeding)...');

        // 1. Seed ROLE (Pakai INSERT IGNORE agar tidak error jika dijalankan 2x)
        // Kita paksa ID-nya agar konsisten
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
        console.error('❌ Seeding GAGAL:', error);
    } finally {
        if (connection) await connection.end();
    }
}

runSeed();