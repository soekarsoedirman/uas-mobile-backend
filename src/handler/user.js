const usrdashboard = async (request, h) => {
    const db = request.server.app.db;

    try {
        const [categories, popularProduct] = await Promise.all([
            db('kategori').select('kategoriID', 'kategoriName'),
            db('product')
                .join('user', 'product.userID', '=', 'user.userID')
                .select(
                    'product.productID',
                    'user.userName',
                    'product.productName',
                    'product.harga',
                    'product.terjual',
                    'product.foto'
                )
                .orderBy('product.terjual', 'desc') 
                .limit(6) // Limit to 10 products
        ]);

        return h.response({
            status: 'success',
            message: 'Data dashboard berhasil diamuat',
            data: {
                kategori: categories,
                populer: popularProduct
            }
        }).code(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};

const searchproduct = async (request, h) => {
    const db = request.server.app.db;
    const { kategori, nama } = request.query;

    if(kategori !== undefined){
        try {
            const products = await db('product')
                .join('user', 'product.userID', '=', 'user.userID')
                .select(
                    'product.productID',
                    'user.userName',
                    'product.productName',
                    'product.harga',
                    'product.terjual',
                    'product.foto'
                )
                .where('product.kategoriID', '=', kategori);
            
                return h.response({
                    status: 'success',
                    message: 'Data produk berhasil diamati',
                    data: products
                }).code(200);
        } catch (error) {
            console.error('Error fetching products:', error);
            return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
        }
    }
    else if(nama !== undefined){
        try {
            const products = await db('product')
                .join('user', 'product.userID', '=', 'user.userID')
                .select(
                    'product.productID',
                    'user.userName',
                    'product.productName',
                    'product.harga',
                    'product.terjual',
                    'product.foto'
                )
                .where('product.productName', 'like', `%${nama}%`);

                return h.response({
                    status: 'success',
                    message: 'Data produk berhasil diamati',
                    data: products
                }).code(200);
        } catch (error) {
            console.error('Error fetching products:', error);
            return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
        }
    }

    return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
};

const productdetail = async (request, h) => {
    const db = request.server.app.db;
    const { productID } = request.params;

    try {
        const product = await db('product')
            .join('user', 'product.userID', '=', 'user.userID')
            .select(
                'product.productID',
                'user.userName',
                'product.productName',
                'product.harga',
                'product.terjual',
                'product.foto',
                'product.deskripsi',
                'product.stok'
            )
            .where('product.productID', '=', productID)
            .first();
        
        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: product
        }).code(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const keranjang = async (request, h) => {
    const db = request.server.app.db;
    try {
        const keranjang = await db('keranjang')
            .join('product','keranjang.productID', '=', 'product.productID')
            .join('user', 'product.userID', '=', 'user.userID')
            .select(
                'keranjang.keranjangID',
                'keranjang.jumlah',
                'product.productName',
                'user.userName',
                'product.harga',
                'product.foto'
            )
            .where('keranjang.userID', '=', request.auth.credentials.user.id);
        
        return h.response({
            status: 'success',
            message: 'Data keranjang berhasil diamati',
            data: keranjang
        }).code(200);
    } catch (error) {
        console.error('Error fetching keranjang:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const tambahkeranjang = async (request, h) => {
    const db = request.server.app.db;
    const userID = request.auth.credentials.user.id;
    const { productID, jumlah } = request.payload;
    try {
        const [insertedId] = await db('keranjang').insert({
            userID: userID,
            productID: productID,
            jumlah: jumlah
        });
        return h.response({
            status: 'success',
            message: 'Data keranjang berhasil ditambahkan',
            data: {
                keranjangID: insertedId
            }
        }).code(200);
    } catch (error) {
        console.error('Error fetching keranjang:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const detailkeranjang = async (request, h) => {
    const db = request.server.app.db;
    const { keranjangID } = request.params;

    try {
        const keranjang = await db('keranjang')
            .join('product', 'keranjang.productID', '=', 'product.productID')
            .join('user', 'product.userID', '=', 'user.userID')
            .select(
                'keranjang.keranjangID',
                'keranjang.jumlah',
                'product.productName',
                'user.userName',
                'product.harga',
                'product.foto'
            )
            .where('keranjang.keranjangID', '=', keranjangID)
            .first();
        
        return h.response({
            status: 'success',
            message: 'Data keranjang berhasil diamati',
            data: keranjang
        }).code(200);
    } catch (error) {
        console.error('Error fetching keranjang:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const hapuskeranjang = async (request, h) => {
    const db = request.server.app.db;
    const { keranjangID } = request.params;
    try {
        const deleted = await db('keranjang').where('keranjangID', '=', keranjangID).del();
        return h.response({
            status: 'success',
            message: 'Data keranjang berhasil dihapus',
            data: deleted
        }).code(200);
    } catch (error) {
        console.error('Error fetching keranjang:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const order = async (request, h) => {
    const db = request.server.app.db;
    const userID = request.auth.credentials.user.id; // Ambil ID dari Token
    const { alamat } = request.payload; // Payload CUMA Alamat

    // Mulai Transaksi Database (Agar aman: jika satu gagal, semua batal)
    const trx = await db.transaction();

    try {
        // 1. Ambil semua item di keranjang user
        // Join ke produk untuk ambil harga terbaru & cek stok
        const cartItems = await trx('keranjang')
            .join('product', 'keranjang.productID', '=', 'product.productID')
            .select(
                'keranjang.keranjangID',
                'keranjang.productID', 
                'keranjang.jumlah', 
                'product.harga',
                'product.stok',      // Kita butuh ini untuk validasi
                'product.productName'
            )
            .where('keranjang.userID', userID);

        if (cartItems.length === 0) {
            await trx.rollback();
            return h.response({ status: 'fail', message: 'Keranjang Anda kosong' }).code(400);
        }

        // 2. Loop Validasi Stok & Hitung Total
        for (const item of cartItems) {
            // Cek apakah stok cukup?
            if (item.stok < item.jumlah) {
                await trx.rollback();
                return h.response({ 
                    status: 'fail', 
                    message: `Stok produk "${item.productName}" tidak cukup (Sisa: ${item.stok})` 
                }).code(400);
            }

            const totalHarga = item.harga * item.jumlah;
            
            // A. Insert ke tabel Pembelian
            await trx('pembelian').insert({
                userID: userID,
                productID: item.productID,
                jumlah: item.jumlah,
                alamat: alamat,
                totalHarga: totalHarga,
                status: 'Proses',
                tanggal_transaksi: new Date() // Timestamp sekarang
            });

            // B. UPDATE STOK PRODUK (Kurangi Stok, Tambah Terjual)
            await trx('product')
                .where('productID', item.productID)
                .decrement('stok', item.jumlah)
                .increment('terjual', item.jumlah);
        }

        // 3. Kosongkan keranjang User setelah berhasil beli
        await trx('keranjang').where('userID', userID).del();

        // 4. Commit Transaksi (Simpan permanen)
        await trx.commit();

        return h.response({ status: 'success', message: 'Pembelian berhasil diproses' }).code(201);

    } catch (error) {
        await trx.rollback(); // Batalkan semua perubahan jika ada error
        console.error("Transaction Error:", error);
        return h.response({ status: 'error', message: 'Gagal memproses transaksi' }).code(500);
    }
};
const orderlist = async (request, h) => {
    const db = request.server.app.db;
    const userID = request.auth.credentials.user.id; // Ambil ID dari Token

    try {
        const orders = await db('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .join('user', 'product.userID', '=', 'user.userID')
            .select(
                'pembelian.pembelianID',
                'pembelian.jumlah',
                'pembelian.totalHarga',
                'pembelian.status',
                'pembelian.tanggal_transaksi',
                'product.productName',
                'user.userName',
                'product.foto'
            )
            .where('pembelian.userID', userID);

        return h.response({
            status: 'success',
            message: 'Data order berhasil diamati',
            data: orders
        }).code(200);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const orderdetail = async (request, h) => {
    const db = request.server.app.db;
    const { pembelianID } = request.params;

    try {
        const order = await db('pembelian')
            .join('product', 'pembelian.productID', '=', 'product.productID')
            .join('user', 'product.userID', '=', 'user.userID')
            .select(
                'pembelian.pembelianID',
                'pembelian.jumlah',
                'pembelian.totalHarga',
                'pembelian.status',
                'pembelian.tanggal_transaksi',
                'pembelian.alamat',
                'product.productName',
                'user.userName',
                'product.foto'
            )
            .where('pembelian.pembelianID', '=', pembelianID)
            .first();
        
        return h.response({
            status: 'success',
            message: 'Data order berhasil diamati',
            data: order
        }).code(200);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};
const orderconfirm = async (request, h) => {
    const db = request.server.app.db;
    const userID = request.auth.credentials.user.id; // ID User yang sedang login
    const { id } = request.params; // ID Pembelian dari URL (ubah 'pembelianID' jadi 'id' biar konsisten sama routes.js)

    try {
        // 1. Cek detail order dulu
        const order = await db('pembelian')
            .where('pembelianID', id)
            .first();
        
        // Validasi: Order harus ada
        if (!order) {
            return h.response({ status: 'fail', message: 'Order tidak ditemukan' }).code(404);
        }

        // Validasi: Harus milik user yang login
        if (order.userID !== userID) {
            return h.response({ status: 'fail', message: 'Akses ditolak. Bukan order Anda.' }).code(403);
        }

        // Validasi Bisnis: Hanya bisa selesai jika status 'Dikirim'
        if (order.status !== 'Dikirim') {
             return h.response({ 
                status: 'fail', 
                message: `Gagal. Status order saat ini adalah '${order.status}'. Hanya order 'Dikirim' yang bisa diselesaikan.` 
            }).code(400);
        }

        // 2. Lakukan Update
        await db('pembelian')
            .where('pembelianID', id)
            .update({ status: 'Selesai' });
        
        return h.response({
            status: 'success',
            message: 'Terima kasih! Order telah dikonfirmasi selesai.'
        }).code(200);

    } catch (error) {
        console.error('Confirm Error:', error);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};
const ordercancel = async (request, h) => {
    const db = request.server.app.db;
    const userID = request.auth.credentials.user.id; // ID User yang sedang login
    const { id } = request.params; // ID Pembelian dari URL (ubah 'pembelianID' jadi 'id' biar konsisten sama routes.js)

    try {
        // 1. Cek detail order dulu
        const order = await db('pembelian')
            .where('pembelianID', id)
            .first();
        
        // Validasi: Order harus ada
        if (!order) {
            return h.response({ status: 'fail', message: 'Order tidak ditemukan' }).code(404);
        }

        // Validasi: Harus milik user yang login
        if (order.userID !== userID) {
            return h.response({ status: 'fail', message: 'Akses ditolak. Bukan order Anda.' }).code(403);
        }

        // Validasi Bisnis: Hanya bisa selesai jika status 'Dikirim'
        if (order.status !== 'Proses') {
             return h.response({ 
                status: 'fail', 
                message: `Gagal. Status order saat ini adalah '${order.status}'. Hanya order 'Proses' yang bisa dicancel.` 
            }).code(400);
        }

        // 2. Lakukan Update
        await db('pembelian')
            .where('pembelianID', id)
            .update({ status: 'Batal' });
        
        return h.response({
            status: 'success',
            message: 'Terima kasih! Order telah dikonfirmasi selesai.'
        }).code(200);

    } catch (error) {
        console.error('Confirm Error:', error);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

module.exports = {
    usrdashboard,
    searchproduct,
    productdetail,
    keranjang,
    tambahkeranjang,
    detailkeranjang,
    hapuskeranjang,
    order,
    orderlist,
    orderdetail,
    orderconfirm,
    ordercancel
}