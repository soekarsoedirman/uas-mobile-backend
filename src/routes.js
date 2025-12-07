const Joi = require('joi');
const { addProductHandler } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/products',
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
        handler: addProductHandler
    }
];

module.exports = routes;