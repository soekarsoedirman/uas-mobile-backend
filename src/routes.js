const Joi = require('joi');
const { authlogin, authregister, authlogout}= require('./handler/auth');
const {  
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
}= require('./handler/user');
const {
    sldashboard,
    slproductlist,
    sladdproduct,
    sleditproduct,
    sldeleteproduct,
    slorderlist,
    slorderdetail,
    slorderconfirm,
    slordercancel
}= require('./handler/seller');

const routes = [
    //AUTH SECTION
    //AUTH SECTION
    {
        method: 'POST',
        path: '/login',
        options: {
            auth: false, 
        },
        handler: authlogin,
    },
    {
        method: 'POST',
        path: '/register',
        options: {
            auth: false, 
        },
        handler: authregister,
    },
    {
        method: 'POST',
        path: '/logout',
        options: {
            auth: false, 
        },
        handler: authlogout,
    },
    //USER SECTION 
    //USER SECTION
    {
        method: 'GET',
        path: '/dashboard',
        handler: usrdashboard,
    },
    {
        //ini buatsearching
        method: 'GET',
        path: '/products',
        handler: searchproduct,
    },
    {
        method: 'GET',
        path:'/products/{id}',
        handler: productdetail,
    },
    {
        //keranjang
        method: 'GET',
        path: '/cart',
        handler: keranjang,
    },
    {
        method: 'POST',
        path: '/cart',
        handler: tambahkeranjang,
    },
    {
        method: 'GET',
        path: '/cart/{id}',
        handler: detailkeranjang,
    },
    {
        method: 'DELETE',
        path: '/cart/{id}',
        handler: hapuskeranjang,
    },
    {
        //pembelian
        method: 'POST',
        path: '/order',
        handler: order,
    },
    {
        //histori pembelian
        method: 'GET',
        path: '/order',
        options: {
            validate: {
                payload: Joi.object({
                    alamat: Joi.string().required().min(10), 
                })
            }
        },
        handler: orderlist,
    },
    {
        //detail pembelian
        method: 'GET',
        path: '/order/{id}',
        handler: orderdetail,
    },
    {
        //verivikasi datang
        method: 'POST',
        path: '/order/{id}/confirm',
        handler: orderconfirm,
    },
    {
        //verivikasi datang
        method: 'POST',
        path: '/order/{id}/cancel',
        handler: ordercancel,
    },

    //SELLER SECTION
    //SELLER SECTION
    {
        method: 'GET',
        path: '/seller/dashboard',
        handler: sldashboard,
    },
    {
        method: 'GET',
        path: '/seller/products',
        handler: slproductlist,
    },
    {
        //add product
        method: 'POST',
        path: '/seller/products',
        options: {
            // Konfigurasi Upload File
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data', // Wajib untuk upload gambar
                multipart: true,
                maxBytes: 5 * 1024 * 1024 // Maksimal 5MB
            },
            // Validasi Input dengan Joi
            validate: {
                payload: Joi.object({
                    productName: Joi.string().min(3).required(),
                    harga: Joi.number().min(100).required(),
                    stok: Joi.number().integer().min(0).required(),
                    deskripsi: Joi.string().optional(),
                    userID: Joi.number().integer().required(),    // ID User dummy
                    kategoriID: Joi.number().integer().required(), // ID Kategori dummy
                    image: Joi.any().meta({ swaggerType: 'file' }).required() // File gambar
                }),
                failAction: (request, h, err) => {
                    // Menampilkan pesan error validasi yang jelas
                    throw err;
                }
            }
        },
        handler: sladdproduct,
    },
    {
        //edit product
        method: 'PUT',
        path: '/seller/products/{id}',
        options: {
            // Konfigurasi Upload File
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data', // Wajib untuk upload gambar
                multipart: true,
                maxBytes: 5 * 1024 * 1024 // Maksimal 5MB
            },
            // Validasi Input dengan Joi
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                }),
                payload: Joi.object({
                    productName: Joi.string().min(3).required(),
                    harga: Joi.number().min(100).required(),
                    stok: Joi.number().integer().min(0).required(),
                    deskripsi: Joi.string().optional(),
                    userID: Joi.number().integer().required(),    // ID User dummy
                    kategoriID: Joi.number().integer().required(), // ID Kategori dummy
                    image: Joi.any().meta({ swaggerType: 'file' }).required() // File gambar
                }),
                failAction: (request, h, err) => {
                    // Menampilkan pesan error validasi yang jelas
                    throw err;
                }
            }
        },
        handler: sleditproduct,
    },
    {
        //delete product
        method: 'DELETE',
        path: '/seller/products/{id}',
        handler: sldeleteproduct,
    },
    {
        //histori penjualan
        method: 'GET',
        path: '/seller/order',
        handler: slorderlist,
    },
    {
        //detail penjualan
        method: 'GET',
        path: '/seller/order/{id}',
        handler: slorderdetail,
    },
    {
        //verifikasi kirim barang
        method: 'POST',
        path: '/seller/order/{id}/confirm',
        handler: slorderconfirm,
    },
    {
        //verifikasi kirim barang
        method: 'POST',
        path: '/seller/order/{id}/cancel',
        handler: slordercancel,
    },
    {
        method: "*",
        path: '/{any*}', 
        handler: (request, h) => {
            const response = h.response({
                status: 'fail',
                message: 'Halaman tidak ditemukan',
            });

            response.code(404);
            
            return response;
        }
    },
];

module.exports = routes;