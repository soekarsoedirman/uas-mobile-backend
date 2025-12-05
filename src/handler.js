const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Karena pakai IAM Role, tidak perlu isi credentials di sini!
// SDK akan otomatis mendeteksi Role dari EC2.
const s3 = new S3Client({
    region: 'us-east-1' // Sesuaikan region bucket Anda (misal ap-southeast-1 untuk Singapore)
});

const uploadImage = async (file) => {
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: 'toko-mobile-project-2025', // Nama bucket Anda
            Key: `products/${Date.now()}_${file.hapi.filename}`, // Nama file unik
            Body: file, // Stream file dari Hapi
            ContentType: file.hapi.headers['content-type'],
            ACL: 'public-read' // Agar gambar bisa dilihat di aplikasi Flutter
        }
    });

    const result = await upload.done();
    return result.Location; // Mengembalikan URL gambar (https://s3...)
};

// Route Hapi
server.route({
    method: 'POST',
    path: '/upload',
    options: {
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data', // Penting untuk upload file
            maxBytes: 5 * 1024 * 1024 // Limit 5MB
        }
    },
    handler: async (request, h) => {
        const data = request.payload;
        if (data.image) {
            try {
                const imageUrl = await uploadImage(data.image);
                // Simpan imageUrl ini ke database RDS Anda di sini
                return { status: 'success', url: imageUrl };
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Upload failed' }).code(500);
            }
        }
        return h.response({ error: 'No image provided' }).code(400);
    }
});


module.exports = uploadImage;