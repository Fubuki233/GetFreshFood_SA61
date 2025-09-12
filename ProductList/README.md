# 产品管理系统 (Product Management System)

这是一个基于Web的产品管理系统，支持通过API获取数据并动态生成产品卡片。

## 功能特性

- 📦 **动态产品加载**: 通过API获取产品数据并动态生成产品卡片
- 🔍 **实时搜索**: 根据产品名称、分类或描述进行实时搜索过滤
- ➕ **产品管理**: 创建、编辑、删除产品
- 📱 **响应式设计**: 适配移动设备和桌面设备
- 🎨 **现代化UI**: 清洁美观的用户界面设计

## 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **API**: RESTful API (支持本地和远程API)
- **样式**: CSS Grid/Flexbox, 自定义CSS变量

## 使用方法

### 方法1: 使用远程测试API (默认)

1. 直接打开 `index.html` 文件在浏览器中
2. 系统会自动从 `https://fakestoreapi.com/products` 获取测试数据

### 方法2: 使用本地API服务器

1. 确保已安装 Node.js
2. 在终端中运行本地API服务器:
   ```bash
   node api-server.js
   ```
3. 修改 `global.js` 中的 `apiBaseUrl`:
   ```javascript
   this.apiBaseUrl = 'http://localhost:3000/api/products';
   ```
4. 打开 `index.html` 文件

## API 端点

### 远程API (FakeStore API)
- `GET https://fakestoreapi.com/products` - 获取所有产品
- `GET https://fakestoreapi.com/products/{id}` - 获取单个产品
- `POST https://fakestoreapi.com/products` - 创建产品
- `PUT https://fakestoreapi.com/products/{id}` - 更新产品
- `DELETE https://fakestoreapi.com/products/{id}` - 删除产品

### 本地API服务器
- `GET http://localhost:3000/api/products` - 获取所有产品
- `GET http://localhost:3000/api/products/{id}` - 获取单个产品  
- `POST http://localhost:3000/api/products` - 创建产品
- `PUT http://localhost:3000/api/products/{id}` - 更新产品
- `DELETE http://localhost:3000/api/products/{id}` - 删除产品

## 产品数据结构

```json
{
  "id": 1,
  "title": "产品标题",
  "price": 19.99,
  "category": "产品分类",
  "description": "产品描述",
  "image": "图片URL",
  "rating": {
    "rate": 4.5,
    "count": 120
  }
}
```

## 功能说明

### 搜索功能
- 支持按产品名称、分类、描述进行实时搜索
- 搜索结果会实时更新，无需点击搜索按钮

### 产品卡片
每个产品卡片显示:
- 产品图片
- 产品标题
- 价格 (突出显示)
- 分类标签
- 产品描述 (截断显示)
- 评分和评论数量
- 操作按钮 (编辑、删除、查看详情)

### 产品详情模态框
点击"查看详情"按钮会显示包含完整产品信息的模态框:
- 大图预览
- 完整描述
- 详细评分信息

### 创建/编辑产品
通过表单可以:
- 创建新产品
- 编辑现有产品信息
- 表单验证确保数据完整性

## 自定义配置

### 切换API来源
在 `global.js` 文件中修改 `apiBaseUrl`:

```javascript
// 使用远程测试API
this.apiBaseUrl = 'https://fakestoreapi.com/products';

// 使用本地API服务器
this.apiBaseUrl = 'http://localhost:3000/api/products';

// 使用自定义API
this.apiBaseUrl = 'https://your-api-domain.com/api/products';
```

### 样式自定义
CSS变量定义在 `global.css` 的 `:root` 选择器中，可以轻松修改颜色主题:

```css
:root {
  --color-text: #1e1e1e;
  --color-background: #ffffff;
  --color-border: #d9d9d9;
  /* ... 更多变量 */
}
```

## 文件结构

```
ProductList/
├── index.html          # 主页面
├── global.css          # 样式文件
├── global.js           # JavaScript功能
├── api-server.js       # 本地API服务器 (可选)
├── README.md           # 说明文档
└── images/             # 图片资源
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. **跨域问题**: 如果使用本地文件打开，某些浏览器可能阻止API请求。建议使用本地服务器或允许跨域。

2. **图片加载**: 产品图片如果加载失败会显示默认占位图。

3. **API限制**: FakeStore API仅用于测试，实际的增删改操作不会持久化。

4. **本地存储**: 当前版本不支持本地数据持久化，刷新页面会重新加载API数据。

## 开发建议

- 可以集成真实的后端API
- 添加用户认证系统
- 实现购物车功能
- 添加产品分类筛选
- 支持产品图片上传
- 实现分页功能处理大量数据
