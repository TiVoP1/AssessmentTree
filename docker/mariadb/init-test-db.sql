-- Grant full privileges (needed for Prisma shadow database during migrations)
GRANT ALL PRIVILEGES ON *.* TO 'property_user'@'%' WITH GRANT OPTION;

CREATE DATABASE IF NOT EXISTS property_manager_test;
FLUSH PRIVILEGES;
