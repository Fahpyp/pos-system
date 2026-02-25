-- POS System Database Setup
CREATE DATABASE IF NOT EXISTS pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_db;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','STAFF') NOT NULL DEFAULT 'STAFF',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `description` text,
  `price` double NOT NULL DEFAULT 0,
  `cost` double NOT NULL DEFAULT 0,
  `stock` int NOT NULL DEFAULT 0,
  `category` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sale` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceNo` varchar(191) NOT NULL,
  `total` double NOT NULL DEFAULT 0,
  `tax` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `payment` varchar(50) NOT NULL DEFAULT 'CASH',
  `status` varchar(50) NOT NULL DEFAULT 'COMPLETED',
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoiceNo` (`invoiceNo`),
  KEY `userId` (`userId`),
  CONSTRAINT `sale_user_fk` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `saleitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL DEFAULT 1,
  `price` double NOT NULL DEFAULT 0,
  `total` double NOT NULL DEFAULT 0,
  `productId` int NOT NULL,
  `saleId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  KEY `saleId` (`saleId`),
  CONSTRAINT `saleitem_product_fk` FOREIGN KEY (`productId`) REFERENCES `product` (`id`),
  CONSTRAINT `saleitem_sale_fk` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `stockmovement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `note` text,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  KEY `userId` (`userId`),
  CONSTRAINT `stock_product_fk` FOREIGN KEY (`productId`) REFERENCES `product` (`id`),
  CONSTRAINT `stock_user_fk` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `activitylog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `entityId` int DEFAULT NULL,
  `details` text,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin user (password: admin123)
INSERT INTO `user` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@pos.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON DUPLICATE KEY UPDATE id=id;

-- Sample products
INSERT INTO `product` (`barcode`, `name`, `description`, `price`, `cost`, `stock`, `category`) VALUES
('8850006110009', 'น้ำดื่มเพียวไลฟ์ 600ml', 'น้ำดื่มบริสุทธิ์', 8, 5, 100, 'เครื่องดื่ม'),
('8850006240004', 'น้ำดื่มเพียวไลฟ์ 1.5L', 'น้ำดื่มบริสุทธิ์', 15, 10, 80, 'เครื่องดื่ม'),
('8850999990001', 'โค้ก 325ml', 'เครื่องดื่มน้ำอัดลม', 15, 11, 60, 'เครื่องดื่ม'),
('8850999990002', 'เป๊บซี่ 325ml', 'เครื่องดื่มน้ำอัดลม', 15, 11, 60, 'เครื่องดื่ม'),
('8851111110001', 'มาม่า รสหมูสับ', 'บะหมี่กึ่งสำเร็จรูป', 6, 4, 200, 'อาหาร'),
('8851111110002', 'มาม่า รสต้มยำ', 'บะหมี่กึ่งสำเร็จรูป', 6, 4, 200, 'อาหาร'),
('8851234560001', 'ขนมปังแผ่น', 'ขนมปังสด', 35, 25, 30, 'อาหาร'),
('8851234560002', 'ไข่ไก่ (แผง 30 ฟอง)', 'ไข่ไก่สด', 120, 95, 20, 'อาหาร')
ON DUPLICATE KEY UPDATE id=id;
