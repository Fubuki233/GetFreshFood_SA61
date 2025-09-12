-- 产品管理系统数据库设置脚本
-- 请在MySQL中执行此脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS NUS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE NUS;

-- 创建products表
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '产品ID',
    name VARCHAR(255) NOT NULL COMMENT '产品名称',
    product_type VARCHAR(100) DEFAULT 'Goods' COMMENT '产品类型',
    sales_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '销售价格',
    sales_tax_rate VARCHAR(50) DEFAULT '9% SR' COMMENT '销售税率',
    sales_price_incl_tax DECIMAL(10,2) DEFAULT 0.00 COMMENT '含税销售价格',
    cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '成本',
    purchase_tax_rate VARCHAR(50) DEFAULT '9% TX' COMMENT '采购税率',
    category VARCHAR(100) COMMENT '产品分类',
    reference VARCHAR(100) COMMENT '产品编号',
    barcode VARCHAR(100) COMMENT '条形码',
    internal_notes TEXT COMMENT '内部备注',
    description TEXT COMMENT '产品描述',
    invoicing_policy VARCHAR(100) DEFAULT 'Ordered quantities' COMMENT '开票政策',
    created_by VARCHAR(100) COMMENT '创建者',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 创建索引以提高查询性能
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_product_type (product_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- 如果表已存在，添加缺失的列
-- 检查并添加description列
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'NUS' 
AND TABLE_NAME = 'products' 
AND COLUMN_NAME = 'description';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN description TEXT COMMENT "产品描述" AFTER internal_notes', 
    'SELECT "Column description already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加updated_at列
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'NUS' 
AND TABLE_NAME = 'products' 
AND COLUMN_NAME = 'updated_at';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间" AFTER created_at', 
    'SELECT "Column updated_at already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 插入示例数据（如果表为空）
INSERT INTO products (name, product_type, sales_price, sales_tax_rate, sales_price_incl_tax, cost, purchase_tax_rate, category, description, invoicing_policy, created_by) 
SELECT * FROM (
    SELECT '新鲜有机苹果' as name, 'Goods' as product_type, 8.99 as sales_price, '9% SR' as sales_tax_rate, 9.80 as sales_price_incl_tax, 6.00 as cost, '9% TX' as purchase_tax_rate, '水果' as category, '来自本地农场的新鲜有机苹果，香甜脆嫩，营养丰富' as description, 'Ordered quantities' as invoicing_policy, 'system' as created_by
    UNION ALL
    SELECT '全麦面包', 'Goods', 12.50, '9% SR', 13.63, 8.00, '9% TX', '烘焙食品', '新鲜烘焙的全麦面包，含有坚果和谷物，健康美味', 'Ordered quantities', 'system'
    UNION ALL
    SELECT '有机牛奶', 'Goods', 15.99, '9% SR', 17.43, 12.00, '9% TX', '乳制品', '来自草饲奶牛的新鲜有机牛奶，营养丰富口感醇厚', 'Ordered quantities', 'system'
    UNION ALL
    SELECT '散养鸡蛋', 'Goods', 18.99, '9% SR', 20.70, 14.00, '9% TX', '乳制品', '农场散养鸡蛋，新鲜营养，适合各种烹饪方式', 'Ordered quantities', 'system'
    UNION ALL
    SELECT '新鲜三文鱼片', 'Goods', 45.99, '9% SR', 50.13, 35.00, '9% TX', '海鲜', '优质新鲜三文鱼片，富含Omega-3脂肪酸，适合烧烤或烘焙', 'Ordered quantities', 'system'
) as tmp
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- 显示表结构
DESCRIBE products;

-- 显示插入的示例数据
SELECT product_id, name, sales_price, category, created_at FROM products LIMIT 5;

-- 显示表统计信息
SELECT 
    COUNT(*) as total_products,
    COUNT(DISTINCT category) as categories_count,
    AVG(sales_price) as avg_price,
    MIN(sales_price) as min_price,
    MAX(sales_price) as max_price
FROM products;
