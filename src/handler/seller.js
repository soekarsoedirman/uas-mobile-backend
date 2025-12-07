const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');

// Inisiasi S3 Client (Otomatis pakai IAM Role EC2)
const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-3'
});

// sldashboard,
// slproductlist,
// sladdproduct,
// sleditproduct,
// sldeleteproduct,
// slorderlist,
// slorderdetail,
// slorderconfirm,
// slordercancel

const sldashboard = async (request, h) => {

};
const slproductlist = async (request, h) => {

};
const sladdproduct = async (request, h) => {
    // 1. Ambil instance database (Knex) dari server.app
    const db = request.server.app.db;

    // 2. Ambil data dari payload
    const { productName, harga, stok, deskripsi, userID, kategoriID, image } = request.payload;

    try {
        // --- PROSES UPLOAD KE S3 ---
        const fileExtension = image.hapi.filename.split('.').pop();
        const uniqueFileName = `products/${uuidv4()}.${fileExtension}`; // Contoh: products/abc-123.jpg

        const upload = new Upload({
            client: s3,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: uniqueFileName,
                Body: image, // Stream file
                ContentType: image.hapi.headers['content-type'],
                ACL: 'public-read'
            }
        });

        // Tunggu proses upload selesai
        const s3Result = await upload.done();
        const imageUrl = s3Result.Location; // URL Gambar dari S3

        // --- PROSES INSERT KE RDS (MySQL) ---
        // Masukkan data sesuai nama kolom di CSV kamu
        // Kolom: productID (Auto), userID, productName, kategoriID, harga, stok, terjual, deskripsi, foto

        const [insertedId] = await db('product').insert({
            userID: userID,
            productName: productName,
            kategoriID: kategoriID,
            harga: harga,
            stok: stok,
            terjual: 0, // Default 0
            deskripsi: deskripsi,
            foto: imageUrl // Simpan URL S3 di kolom 'foto'
        });

        // --- RESPONSE SUKSES ---
        return h.response({
            status: 'success',
            message: 'Produk berhasil ditambahkan',
            data: {
                productID: insertedId,
                productName,
                imageUrl
            }
        }).code(201);

    } catch (error) {
        console.error('Error saat input produk:', error);

        // Cek error spesifik (misal Foreign Key tidak ketemu)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return h.response({
                status: 'fail',
                message: 'UserID atau KategoriID tidak ditemukan di database. Pastikan data master ada.'
            }).code(400);
        }

        return h.response({
            status: 'error',
            message: 'Gagal menambahkan produk'
        }).code(500);
    }
};
const sleditproduct = async (request, h) => {

};
const sldeleteproduct = async (request, h) => {

};
const slorderlist = async (request, h) => {

};
const slorderdetail = async (request, h) => {

};
const slorderconfirm = async (request, h) => {

};
const slordercancel = async (request, h) => {

};

module.exports = {
    sldashboard,
    slproductlist,
    sladdproduct,
    sleditproduct,
    sldeleteproduct,
    slorderlist,
    slorderdetail,
    slorderconfirm,
    slordercancel
}
