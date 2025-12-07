-- Matikan pengecekan foreign key sementara agar bisa drop table dengan aman
SET FOREIGN_KEY_CHECKS = 0;

-- Hapus tabel lama jika ada (Reset) - Hati-hati, ini menghapus data!
DROP TABLE IF EXISTS pembelian;
DROP TABLE IF EXISTS keranjang;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS kategori;
DROP TABLE IF EXISTS role;

-- Nyalakan kembali pengecekan foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabel ROLE
CREATE TABLE role (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    rolename VARCHAR(50) NOT NULL
);

-- 2. Tabel KATEGORI
CREATE TABLE kategori (
    kategoriID INT AUTO_INCREMENT PRIMARY KEY,
    kategoriName VARCHAR(100) NOT NULL
);

-- 3. Tabel USER
CREATE TABLE user (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(100) NOT NULL,
    roleID INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    noHp VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (roleID) REFERENCES role(roleID)
);

-- 4. Tabel PRODUCT
CREATE TABLE product (
    productID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL, -- ID Penjual
    productName VARCHAR(150) NOT NULL,
    kategoriID INT NOT NULL,
    harga DECIMAL(15, 2) NOT NULL,
    stok INT DEFAULT 0,
    terjual INT DEFAULT 0,
    deskripsi TEXT,
    foto VARCHAR(255), -- URL gambar S3
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_user FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE,
    CONSTRAINT fk_product_kategori FOREIGN KEY (kategoriID) REFERENCES kategori(kategoriID)
);

-- 5. Tabel KERANJANG
CREATE TABLE keranjang (
    keranjangID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    productID INT NOT NULL,
    jumlah INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_keranjang_user FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE,
    CONSTRAINT fk_keranjang_product FOREIGN KEY (productID) REFERENCES product(productID) ON DELETE CASCADE
);

-- 6. Tabel PEMBELIAN
CREATE TABLE pembelian (
    pembelianID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    productID INT NOT NULL,
    jumlah INT NOT NULL,
    alamat TEXT NOT NULL,
    totalHarga DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    tanggal_transaksi DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pembelian_user FOREIGN KEY (userID) REFERENCES user(userID),
    CONSTRAINT fk_pembelian_product FOREIGN KEY (productID) REFERENCES product(productID)
);