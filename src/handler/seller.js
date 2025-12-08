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
    const db = request.server.app.db;
    // KOREKSI 1: Ambil ID dari user.id (sesuai struktur token di auth.js)
    const sellerID = request.auth.credentials.user.id;

    try {
        // 1. Hitung Total Produk Saya
        const productResult = await db('product')
            .where('userID', sellerID)
            .count('productID as count')
            .first();

        // 2. Hitung Total Order & Sales (Hanya yang status SELESAI)
        // KOREKSI 2: Join ke tabel 'product' dulu untuk tahu seller-nya siapa
        const salesResult = await db('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .where('product.userID', sellerID)       // Filter: Produk milik seller ini
            .where('pembelian.status', 'Selesai')    // Filter: Hanya hitung yang sudah SELESAI
            .sum('pembelian.totalHarga as totalSales')
            .count('pembelian.pembelianID as totalOrders')
            .first();

        const data = {
            totalProducts: parseInt(productResult.count) || 0,
            totalOrders: parseInt(salesResult.totalOrders) || 0,
            // Handle jika null (belum ada penjualan)
            totalSales: parseInt(salesResult.totalSales) || 0
        };

        return h.response({
            status: 'success',
            message: 'Data dashboard berhasil dimuat',
            data: data
        }).code(200);

    } catch (error) {
        console.error('Dashboard Error:', error);
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan saat mengambil data dashboard'
        }).code(500);
    }
};

const slproductlist = async (request, h) => {
    const db = request.server.app.db;
    const userID = request.auth.credentials.user.id;

    try {
        const listproducts = await db('product')
            .join('user', 'product.userID', '=', 'user.userID')
            .select(
                'product.productID',
                'user.userName',
                'product.productName',
                'product.harga',
                'product.terjual',
                'product.foto'
            )
            .where('product.userID', '=', userID);
        
        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: listproducts
        }).code(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan saat mengambil data produk'
        }).code(500);
    }
};
const sladdproduct = async (request, h) => {
    // 1. Ambil instance database (Knex) dari server.app
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;

    // 2. Ambil data dari payload
    const { productName, harga, stok, deskripsi, kategoriID, image } = request.payload;

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
            userID: sellerID,
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
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;
    const { id } = request.params;
    const { productName, harga, stok, deskripsi, kategoriID, image } = request.payload;

    try {
        const product = await db('product').where({ productID: id, userID: sellerID }).first();
        if (!product) return h.response({ status: 'fail', message: 'Akses ditolak / Produk tidak ada' }).code(403);

        let updateData = { productName, harga, stok, deskripsi, kategoriID };

        if (image) {
            const fileExtension = image.hapi.filename.split('.').pop();
            const uniqueFileName = `products/${uuidv4()}.${fileExtension}`;
            const upload = new Upload({
                client: s3,
                params: {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: uniqueFileName,
                    Body: image,
                    ContentType: image.hapi.headers['content-type'],
                    ACL: 'public-read'
                }
            });
            const s3Result = await upload.done();
            updateData.foto = s3Result.Location;
        }

        await db('product').where('productID', id).update(updateData);
        return h.response({ status: 'success', message: 'Produk diupdate' }).code(200);

    } catch (error) {
        console.error('Error saat update produk:', error);
        return h.response({ status: 'error',  message: 'Gagal mengupdate produk' }).code(500);
    }
};
const sldeleteproduct = async (request, h) => {
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;
    const { id } = request.params;

    try {
        const product = await db('product').where({ productID: id, userID: sellerID }).del();
        return h.response({ 
            status: 'success', 
            message: 'Produk dihapus',
            data: product,
        }).code(200);
    } catch (error) {
        console.error('Error saat delete produk:', error);
        return h.response({ status: 'error', message: 'Gagal menghapus produk' }).code(500);
    }
};
const slorderlist = async (request, h) => {
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;
    try {
        const orderList = await db('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .join('user', 'pembelian.userID', '=', 'user.userID')
            .select(
                'pembelian.pembelianID',
                'user.userName',
                'product.productName',
                'pembelian.totalHarga',
                'pembelian.status',
                'pembelian.tanggal_transaksi'
            )
            .where('product.userID', '=', sellerID);

        return h.response({
            status: 'success',
            message: 'Data order berhasil dimuat',
            data: orderList
        }).code(200);
    } catch (error) {
        console.error('Error saat fetch order list:', error);
        return h.response({ status: 'error', message: 'Gagal mengambil data order' }).code(500);
    }
};
const slorderdetail = async (request, h) => {
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;
    const { id } = request.params;

    try {
        const orderDetail = await db('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .join('user', 'pembelian.userID', '=', 'user.userID')
            .select(
                'pembelian.pembelianID',
                'user.userName',
                'product.productName',
                'pembelian.jumlah',
                'pembelian.alamat',
                'pembelian.totalHarga',
                'pembelian.status',
                'pembelian.tanggal_transaksi'
            )
            .where('product.userID', '=', sellerID)
            .andWhere('pembelian.pembelianID', '=', id)
            .first();
        
        return h.response({
            status: 'success',
            message: 'Data order berhasil dimuat',
            data: orderDetail
        }).code(200);
    } catch (error) {
        console.error('Error saat fetch order detail:', error);
        return h.response({ status: 'error', message: 'Gagal mengambil data order' }).code(500);
    }
};
const slorderconfirm = async (request, h) => {
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;
    const { id } = request.params; // ID Pembelian

    // Mulai Transaksi (Agar aman update 2 tabel sekaligus)
    const trx = await db.transaction();

    try {
        // 1. Cek Order & Validasi Milik Seller
        // Kita perlu ambil 'productID' dan 'jumlah' untuk update stok nanti
        const order = await trx('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .select(
                'pembelian.pembelianID',
                'pembelian.status',
                'pembelian.productID', // Penting untuk update produk
                'pembelian.jumlah',    // Penting untuk kurangi stok
                'product.userID as sellerID',
                'product.stok'         // Cek sisa stok
            )
            .where('pembelian.pembelianID', id)
            .first();
        
        // Validasi: Order tidak ditemukan
        if (!order) {
            await trx.rollback();
            return h.response({ status: 'fail', message: 'Order tidak ditemukan' }).code(404);
        }

        // Validasi: Apakah produk ini milik seller yang login?
        if (order.sellerID !== sellerID) {
            await trx.rollback();
            return h.response({ status: 'fail', message: 'Akses ditolak. Bukan produk Anda.' }).code(403);
        }

        // Validasi Status: Hanya bisa kirim jika status masih 'Pending'
        if (order.status !== 'Pending') {
            await trx.rollback();
            return h.response({ 
                status: 'fail', 
                message: `Gagal. Status order saat ini '${order.status}'. Hanya order 'Pending' yang bisa dikirim.` 
            }).code(400);
        }

        // Validasi Stok: Cek apakah stok cukup sebelum dikurangi
        if (order.stok < order.jumlah) {
            await trx.rollback();
            return h.response({ status: 'fail', message: 'Stok produk tidak cukup untuk memenuhi pesanan ini.' }).code(400);
        }

        // 2. Update Status Pembelian -> 'Dikirim'
        await trx('pembelian')
            .where('pembelianID', id)
            .update({ status: 'Dikirim' });

        // 3. Update Tabel Produk (Kurangi Stok, Tambah Terjual)
        await trx('product')
            .where('productID', order.productID)
            .decrement('stok', order.jumlah)   // Kurangi stok sesuai jumlah beli
            .increment('terjual', order.jumlah); // Tambah terjual sesuai jumlah beli

        // Simpan Perubahan
        await trx.commit();
        
        return h.response({
            status: 'success',
            message: 'Orderan telah dikirim. Stok produk berhasil diperbarui.'
        }).code(200);

    } catch (error) {
        // Batalkan semua perubahan jika ada error
        await trx.rollback();
        console.error('Confirm Error:', error);
        return h.response({ status: 'error', message: 'Gagal memproses order' }).code(500);
    }
};
const slordercancel = async (request, h) => {
    const db = request.server.app.db;
    const sellerID = request.auth.credentials.user.id;
    const { id } = request.params;

    try {
        const order = await db('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .where('product.userID', '=', sellerID)
            .andWhere('pembelian.pembelianID', '=', id)
            .first();
        
        if (!order) {
            return h.response({ status: 'fail', message: 'Order tidak ditemukan' }).code(404);
        }

        if (order.status !== 'Proses') {
            return h.response({ status: 'fail', message: `Gagal. Status order saat ini adalah '${order.status}'. Hanya order 'Proses' yang bisa diselesaikan.` }).code(400);
        }

        await db('pembelian')
            .where('pembelianID', id)
            .update({ status: 'Batal' });
        
        return h.response({
            status: 'success',
            message: 'Orderan telah dibatalkan.'
        }).code(200);
    } catch (error) {
        console.error('Confirm Error:', error);
        return h.response({ status: 'error', message: 'Gagal mengupdate status order' }).code(500);
    }
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
