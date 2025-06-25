-- SQL schema for Scandiweb eCommerce test task
-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    in_stock BOOLEAN NOT NULL,
    gallery JSON NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Attributes
CREATE TABLE IF NOT EXISTS attributes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL
);

-- Attribute Items
CREATE TABLE IF NOT EXISTS attribute_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attribute_id VARCHAR(64) NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id)
);

-- Product-Attribute mapping
CREATE TABLE IF NOT EXISTS product_attributes (
    product_id VARCHAR(64) NOT NULL,
    attribute_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (attribute_id) REFERENCES attributes(id)
);

-- Prices
CREATE TABLE IF NOT EXISTS prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
