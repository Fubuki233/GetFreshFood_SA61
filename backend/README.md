# FastAPI 产品管理系统后端

这是一个基于FastAPI的产品管理系统后端，连接到MySQL数据库，支持完整的CRUD操作。

## 🔧 环境要求

- Python 3.8+
- MySQL 5.7+ 或 8.0+
- 网络连接到 192.168.100.121:3306

## 📦 快速开始

### 方法1: 使用批处理脚本 (推荐)
1. 双击运行 `start.bat`
2. 脚本会自动检查环境、安装依赖并启动服务器

### 方法2: 手动安装

1. **安装依赖**：
```bash
pip install -r requirements.txt
```

2. **配置数据库连接**：
   - 编辑 `.env` 文件（已预配置为您的数据库）
   ```
   DB_HOST=192.168.100.121
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=1
   DB_NAME=NUS
   ```

3. **设置数据库**：
   ```bash
   # 在MySQL中执行
   mysql -h 192.168.100.121 -u root -p1 < setup_database.sql
   ```

4. **检查数据库连接**：
   ```bash
   python check_db.py
   ```

5. **启动服务器**：
   ```bash
   python start.py
   # 或者
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🌐 API 端点

服务器启动后访问: http://localhost:8000

### 核心端点
- `GET /` - 健康检查
- `GET /docs` - API 文档（Swagger UI）
- `GET /redoc` - API 文档（ReDoc）

### 产品管理
- `GET /products` - 获取产品列表（支持搜索和分页）
- `GET /products/{id}` - 获取单个产品
- `POST /products` - 创建新产品
- `PUT /products/{id}` - 更新产品
- `DELETE /products/{id}` - 删除产品

### 辅助端点
- `GET /categories` - 获取所有分类
- `GET /product-types` - 获取所有产品类型
- `POST /import-csv` - 批量导入CSV数据
- `GET /health` - 详细健康检查

## 📊 数据结构

### Product 模型
```json
{
  "product_id": 1,
  "name": "产品名称",
  "product_type": "Goods",
  "sales_price": 19.99,
  "sales_tax_rate": "9% SR",
  "sales_price_incl_tax": 21.79,
  "cost": 15.00,
  "purchase_tax_rate": "9% TX",
  "category": "食品",
  "reference": "REF001",
  "barcode": "1234567890",
  "internal_notes": "内部备注",
  "description": "产品描述",
  "invoicing_policy": "Ordered quantities",
  "created_by": "user123",
  "created_at": "2025-09-12T10:30:00"
}
```

## 🔍 API 使用示例

### 获取所有产品
```bash
curl http://localhost:8000/products
```

### 搜索产品
```bash
curl "http://localhost:8000/products?name=苹果&category=水果&min_price=5&max_price=20"
```

### 创建产品
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新产品",
    "sales_price": 29.99,
    "category": "食品",
    "description": "这是一个新产品"
  }'
```

### 更新产品
```bash
curl -X PUT http://localhost:8000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新的产品名称",
    "sales_price": 35.99
  }'
```

### 删除产品
```bash
curl -X DELETE http://localhost:8000/products/1
```

## 📁 项目结构

```
backend/
├── main.py              # FastAPI 应用主文件
├── database.py          # 数据库连接配置
├── models.py            # SQLAlchemy 数据模型
├── schemas.py           # Pydantic 数据验证模式
├── services.py          # 业务逻辑服务
├── check_db.py          # 数据库检查脚本
├── start.py             # 启动脚本
├── start.bat            # Windows 批处理启动脚本
├── requirements.txt     # Python 依赖
├── .env                 # 环境变量配置
├── setup_database.sql   # 数据库设置脚本
└── README.md            # 说明文档
```

## 🔨 数据库设置

### 如果products表缺少字段

运行以下SQL命令添加缺失的字段：

```sql
-- 添加description字段
ALTER TABLE products ADD COLUMN description TEXT AFTER internal_notes;

-- 添加updated_at字段
ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 添加索引提高性能
CREATE INDEX idx_name ON products(name);
CREATE INDEX idx_category ON products(category);
CREATE INDEX idx_product_type ON products(product_type);
```

### 从CSV导入数据

1. 通过API端点导入：
```bash
curl -X POST http://localhost:8000/import-csv \
  -F "file=@your_products.csv"
```

2. 或者将CSV文件放在backend目录，然后：
```python
from services import ProductService
from database import SessionLocal

db = SessionLocal()
service = ProductService(db)
result = service.bulk_import_csv("your_products.csv")
print(result)
```

## 🚀 与前端集成

前端项目在 `../ProductList/` 目录中，已配置为连接此后端：

1. 启动后端服务器（端口8000）
2. 打开前端 `index.html` 文件
3. 前端会自动连接到 `http://localhost:8000/products`

如果后端不可用，前端会自动切换到备用API。

## 🔧 故障排除

### 1. 数据库连接失败
```
❌ 数据库连接失败，请检查配置
```
**解决方案**：
- 检查MySQL服务器是否运行
- 确认IP地址、端口、用户名、密码正确
- 检查防火墙设置
- 确认数据库 `NUS` 存在

### 2. 依赖安装失败
```
❌ 依赖安装失败
```
**解决方案**：
- 确保Python版本 >= 3.8
- 更新pip: `pip install --upgrade pip`
- 使用镜像源: `pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/`

### 3. 端口被占用
```
Error: Port 8000 is already in use
```
**解决方案**：
- 修改启动命令端口: `uvicorn main:app --port 8001`
- 或杀死占用进程: `taskkill /f /im python.exe`

### 4. CORS 错误
如果前端无法连接后端，检查CORS设置在 `main.py` 中：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该设置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📈 性能优化

- 数据库连接池已配置
- 添加了数据库索引
- 支持分页查询
- 查询超时设置

## 🔒 安全注意事项

- 在生产环境中修改数据库密码
- 设置具体的CORS域名
- 添加API认证和授权
- 使用HTTPS

## 📝 开发说明

### 添加新字段
1. 修改 `models.py` 中的 `Product` 类
2. 更新 `schemas.py` 中的验证模式
3. 运行数据库迁移或手动添加列

### 添加新API端点
1. 在 `main.py` 中添加新路由
2. 在 `services.py` 中添加业务逻辑
3. 更新API文档

## 📞 技术支持

如果遇到问题：
1. 查看控制台错误信息
2. 检查 `logs/` 目录（如果存在）
3. 运行 `python check_db.py` 诊断数据库
4. 访问 `http://localhost:8000/health` 检查服务状态
