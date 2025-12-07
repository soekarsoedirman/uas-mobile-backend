const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');

// HAPUS BARIS INI: const pool = require('../../database/db_config'); 
// KITA TIDAK BUTUH LAGI KARENA AKAN PAKAI request.server.app.db

const JWT_SECRET = process.env.JWT_SECRET || 'RAHASIA_DAPUR_JANGAN_DISEBAR'; 

// --- 1. HANDLER REGISTER ---
const authregister = async (request, h) => {
    // 1. Ambil DB dari Server (Sama seperti addProduct)
    const db = request.server.app.db;

    const { username, roleID, email, password, noHP } = request.payload;

    try {
        // 2. Cek Email (Pakai Syntax Knex)
        // SQL LAMA: SELECT * FROM user WHERE email = ?
        const existingUser = await db('user').where('email', email).first();
        
        if (existingUser) {
            return h.response({
                status: 'fail',
                message: 'Email sudah terdaftar'
            }).code(400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert Data (Pakai Syntax Knex)
        // SQL LAMA: INSERT INTO user ...
        const [newUserID] = await db('user').insert({
            userName: username,
            roleID: roleID,
            email: email,
            password: hashedPassword, // Perhatikan nama kolom di DB Anda 'password' atau 'pasword'? Sesuaikan.
            noHp: noHP
        });

        // 4. Generate Token
        const token = Jwt.token.generate(
            { id: newUserID, role: roleID, name: username },
            { key: JWT_SECRET, algorithm: 'HS256' },
            { ttlSec: 14400 }
        );

        return h.response({
            username: username,
            roleID: roleID,
            tokenjwt: token
        }).code(201);

    } catch (error) {
        console.error('Register Error:', error);
        return h.response({ status: 'error', message: 'Terjadi kesalahan server' }).code(500);
    }
};

// --- 2. HANDLER LOGIN ---
const authlogin = async (request, h) => {
    // 1. Ambil DB dari Server
    const db = request.server.app.db;
    
    const { email, password } = request.payload;

    try {
        // 2. Cari User (Pakai Syntax Knex)
        // SQL LAMA: SELECT * FROM user WHERE email = ? LIMIT 1
        const user = await db('user').where('email', email).first();

        if (!user) {
            return h.response({
                status: 'fail',
                message: 'Email atau Password salah'
            }).code(401);
        }

        // 3. Cek Password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return h.response({
                status: 'fail',
                message: 'Email atau Password salah'
            }).code(401);
        }

        // 4. Generate Token
        const token = Jwt.token.generate(
            { id: user.userID, role: user.roleID, name: user.userName },
            { key: JWT_SECRET, algorithm: 'HS256' },
            { ttlSec: 14400 }
        );

        return h.response({
            username: user.userName,
            roleID: user.roleID,
            tokenjwt: token
        }).code(200);

    } catch (error) {
        console.error('Login Error:', error);
        return h.response({ status: 'error', message: 'Terjadi kesalahan server' }).code(500);
    }
};

const authlogout = async (request, h) => {
    return h.response({
        status: 'success',
        message: 'Logout berhasil'
    }).code(200);
};

module.exports = { authregister, authlogin, authlogout };