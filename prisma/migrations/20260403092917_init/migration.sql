-- CreateTable
CREATE TABLE `property` (
    `id` VARCHAR(191) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` CHAR(2) NOT NULL,
    `zip_code` CHAR(5) NOT NULL,
    `lat` DOUBLE NULL,
    `long` DOUBLE NULL,
    `weather_data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `property_city_idx`(`city`),
    INDEX `property_state_idx`(`state`),
    INDEX `property_zip_code_idx`(`zip_code`),
    INDEX `property_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
