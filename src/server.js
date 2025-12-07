require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');

// Konfigurasi Knex (Query Builder untuk MySQL)
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 3306
    },
    pool: { min: 2, max: 10 } // Connection pooling agar performa stabil
});

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'] // Mengizinkan akses dari Flutter/Postman
            }
        }
    });

    // Tempelkan instance DB ke server.app agar bisa diakses di handler
    server.app.db = knex;

    // Cek koneksi database saat startup
    try {
        await knex.raw('SELECT 1');
        console.log('✅ Terkoneksi ke RDS Database');
    } catch (err) {
        console.error('❌ Gagal koneksi ke RDS:', err);
        process.exit(1);
    }

    // Daftarkan Routes
    server.route(routes);

    await server.start();
    console.log('🚀 Server berjalan pada %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();