// Product Management System JavaScript

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        // 可以切换到本地API: 'http://localhost:3000/api/products'
        // 或使用远程测试API: 'https://fakestoreapi.com/products'
        this.apiBaseUrl = 'https://fakestoreapi.com/products';
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProducts();
        this.renderProducts();
    }

    bindEvents() {
        // 搜索功能
        const searchInput = document.querySelector('.search-bar__input');
        const searchButton = document.querySelector('.search-bar__button');
        const clearButton = document.querySelector('.search-bar__clear');
        const createButton = document.querySelector('.create-product-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchTerm = searchInput.value;
                this.filterProducts(searchTerm);
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                this.filterProducts('');
            });
        }

        if (createButton) {
            createButton.addEventListener('click', () => {
                this.showCreateProductModal();
            });
        }
    }

    async loadProducts() {
        try {
            this.showLoading();
            
            // 添加超时处理
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
            
            const response = await fetch(this.apiBaseUrl, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.hideLoading();
            
            // 显示加载成功消息
            this.showMessage(`Successfully loaded ${this.products.length} products`, 'success');
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.hideLoading();
            
            if (error.name === 'AbortError') {
                this.showError('Request timeout. Please check your internet connection and try again.');
            } else {
                this.showError('Failed to load products. Please try again later.');
            }
            
            // 提供重试选项
            this.showRetryOption();
        }
    }

    filterProducts(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        this.renderProducts();
    }

    renderProducts() {
        const productList = document.querySelector('.product-list');
        if (!productList) return;

        if (this.filteredProducts.length === 0) {
            productList.innerHTML = '<p class="no-products">No products found.</p>';
            return;
        }

        productList.innerHTML = this.filteredProducts.map(product => `
            <article class="product-card" data-product-id="${product.id}">
                <img class="product-card__image" 
                     src="${product.image}" 
                     alt="${product.title}"
                     onerror="this.src='images/0707e6b2022462187b7b2dab43ed95bab6b24a66.png'">
                <div class="product-card__body">
                    <div class="product-card__text">
                        <h2 class="product-card__title">${product.title}</h2>
                        <p class="product-card__price">$${product.price}</p>
                        <p class="product-card__category">${product.category}</p>
                        <p class="product-card__description">${this.truncateText(product.description, 150)}</p>
                        <div class="product-card__rating">
                            <span class="rating-stars">${this.renderStars(product.rating?.rate || 0)}</span>
                            <span class="rating-count">(${product.rating?.count || 0} reviews)</span>
                        </div>
                    </div>
                    <div class="product-card__actions">
                        <button class="btn btn-edit" onclick="productManager.editProduct(${product.id})">Edit</button>
                        <button class="btn btn-delete" onclick="productManager.deleteProduct(${product.id})">Delete</button>
                        <button class="btn btn-view" onclick="productManager.viewProduct(${product.id})">View Details</button>
                    </div>
                </div>
            </article>
        `).join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (halfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    showLoading() {
        const productList = document.querySelector('.product-list');
        if (productList) {
            productList.innerHTML = '<div class="loading">Loading products...</div>';
        }
    }

    hideLoading() {
        // Loading is hidden when products are rendered
    }

    showError(message) {
        const productList = document.querySelector('.product-list');
        if (productList) {
            productList.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    showMessage(message, type = 'info') {
        // 创建消息提示
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加到页面顶部
        document.body.insertBefore(messageEl, document.body.firstChild);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    showRetryOption() {
        const productList = document.querySelector('.product-list');
        if (productList) {
            productList.innerHTML += `
                <div class="retry-container">
                    <button class="btn btn-primary" onclick="productManager.loadProducts()">
                        Retry Loading Products
                    </button>
                </div>
            `;
        }
    }

    async editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // 简单的编辑功能 - 在实际应用中应该打开一个模态框
        const newTitle = prompt('Edit product title:', product.title);
        const newPrice = prompt('Edit product price:', product.price);
        
        if (newTitle !== null && newPrice !== null) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...product,
                        title: newTitle,
                        price: parseFloat(newPrice)
                    })
                });

                if (response.ok) {
                    // 更新本地数据
                    const productIndex = this.products.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        this.products[productIndex] = {
                            ...this.products[productIndex],
                            title: newTitle,
                            price: parseFloat(newPrice)
                        };
                        this.filteredProducts = [...this.products];
                        this.renderProducts();
                        alert('Product updated successfully!');
                    }
                } else {
                    throw new Error('Failed to update product');
                }
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            }
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // 从本地数据中移除
                this.products = this.products.filter(p => p.id !== productId);
                this.filteredProducts = this.filteredProducts.filter(p => p.id !== productId);
                this.renderProducts();
                alert('Product deleted successfully!');
            } else {
                throw new Error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    }

    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // 显示产品详情模态框
        this.showProductModal(product);
    }

    showProductModal(product) {
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="product-modal__content">
                <div class="product-modal__header">
                    <h2>${product.title}</h2>
                    <button class="product-modal__close">&times;</button>
                </div>
                <div class="product-modal__body">
                    <img src="${product.image}" alt="${product.title}" class="product-modal__image">
                    <div class="product-modal__details">
                        <p class="product-modal__price">Price: $${product.price}</p>
                        <p class="product-modal__category">Category: ${product.category}</p>
                        <p class="product-modal__description">${product.description}</p>
                        <div class="product-modal__rating">
                            <span class="rating-stars">${this.renderStars(product.rating?.rate || 0)}</span>
                            <span class="rating-count">(${product.rating?.count || 0} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        const closeBtn = modal.querySelector('.product-modal__close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showCreateProductModal() {
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="product-modal__content">
                <div class="product-modal__header">
                    <h2>Create New Product</h2>
                    <button class="product-modal__close">&times;</button>
                </div>
                <div class="product-modal__body">
                    <form class="create-product-form">
                        <div class="form-group">
                            <label for="product-title">Title:</label>
                            <input type="text" id="product-title" required>
                        </div>
                        <div class="form-group">
                            <label for="product-price">Price:</label>
                            <input type="number" id="product-price" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Category:</label>
                            <input type="text" id="product-category" required>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Description:</label>
                            <textarea id="product-description" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="product-image">Image URL:</label>
                            <input type="url" id="product-image" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Create Product</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        const closeBtn = modal.querySelector('.product-modal__close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        const form = modal.querySelector('.create-product-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createProduct(form);
            document.body.removeChild(modal);
        });
    }

    async createProduct(form) {
        const formData = new FormData(form);
        const productData = {
            title: form.querySelector('#product-title').value,
            price: parseFloat(form.querySelector('#product-price').value),
            category: form.querySelector('#product-category').value,
            description: form.querySelector('#product-description').value,
            image: form.querySelector('#product-image').value
        };

        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const newProduct = await response.json();
                // 为新产品分配一个临时ID（因为API返回的ID可能不是真实的）
                newProduct.id = this.products.length + 1;
                this.products.unshift(newProduct);
                this.filteredProducts = [...this.products];
                this.renderProducts();
                alert('Product created successfully!');
            } else {
                throw new Error('Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        }
    }
}

// 初始化产品管理器
let productManager;
document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});