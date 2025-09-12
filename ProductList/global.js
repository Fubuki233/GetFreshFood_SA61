// Product Management System JavaScript

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        // FastAPI backend address
        this.apiBaseUrl = 'http://ctrl.zyh111.icu:8000/products';
        // Fallback remote API (if local backend is unavailable)
        this.fallbackApiUrl = 'https://fakestoreapi.com/products';
        this.useLocalApi = true;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProducts();
        this.renderProducts();
    }

    bindEvents() {
        // Search functionality
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
            
            // Add timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            let response;
            let apiUrl = this.useLocalApi ? this.apiBaseUrl : this.fallbackApiUrl;
            
            try {
                response = await fetch(apiUrl, {
                    signal: controller.signal
                });
            } catch (error) {
                // If local API fails, try fallback API
                if (this.useLocalApi && error.name !== 'AbortError') {
                    console.warn('Local API connection failed, trying fallback API...');
                    this.useLocalApi = false;
                    apiUrl = this.fallbackApiUrl;
                    response = await fetch(apiUrl, {
                        signal: controller.signal
                    });
                } else {
                    throw error;
                }
            }
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle different API formats
            if (this.useLocalApi && data.data) {
                // FastAPI format
                this.products = data.data;
            } else if (Array.isArray(data)) {
                // Direct array format
                this.products = data;
            } else {
                this.products = [];
            }
            
            this.filteredProducts = [...this.products];
            this.hideLoading();
            
            // Show success message
            const apiType = this.useLocalApi ? 'Local API' : 'Remote API';
            this.showMessage(`Successfully loaded ${this.products.length} products from ${apiType}`, 'success');
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.hideLoading();
            
            if (error.name === 'AbortError') {
                this.showError('Request timeout, please check your network connection and try again.');
            } else {
                this.showError('Failed to load products, please check if the backend server is running.');
            }
            
            // Provide retry option
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

        productList.innerHTML = this.filteredProducts.map(product => {
            // Handle different API format data
            const id = product.product_id || product.id;
            const title = product.name || product.title;
            const price = product.sales_price || product.price;
            const category = product.category;
            const description = product.description;
            const image = product.image || 'images/0707e6b2022462187b7b2dab43ed95bab6b24a66.png';
            const rating = product.rating || { rate: 0, count: 0 };
            
            return `
                <article class="product-card" data-product-id="${id}">
                    <img class="product-card__image" 
                         src="${image}" 
                         alt="${title}"
                         onerror="this.src='images/0707e6b2022462187b7b2dab43ed95bab6b24a66.png'">
                    <div class="product-card__body">
                        <div class="product-card__text">
                            <h2 class="product-card__title">${title}</h2>
                            <p class="product-card__price">$${price}</p>
                            ${category ? `<p class="product-card__category">${category}</p>` : ''}
                            <p class="product-card__description">${this.truncateText(description || 'No description available', 150)}</p>
                            <div class="product-card__rating">
                                <span class="rating-stars">${this.renderStars(rating.rate || 0)}</span>
                                <span class="rating-count">(${rating.count || 0} reviews)</span>
                            </div>
                        </div>
                        <div class="product-card__actions">
                            <button class="btn btn-edit" onclick="productManager.editProduct(${id})">Edit</button>
                            <button class="btn btn-delete" onclick="productManager.deleteProduct(${id})">Delete</button>
                            <button class="btn btn-view" onclick="productManager.viewProduct(${id})">View Details</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
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
        // Create message notification
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Add to top of page
        document.body.insertBefore(messageEl, document.body.firstChild);
        
        // Auto disappear after 3 seconds
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

        // Simple edit functionality - should open a modal in real application
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
                    // Update local data
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
                // Remove from local data
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

        // Show product details modal
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

        // Bind close events
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
                            <label for="product-title">Product Name *:</label>
                            <input type="text" id="product-title" required>
                        </div>
                        <div class="form-group">
                            <label for="product-price">Sales Price *:</label>
                            <input type="number" id="product-price" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Product Category:</label>
                            <input type="text" id="product-category" list="categories">
                            <datalist id="categories">
                                <option value="Food">
                                <option value="Beverages">
                                <option value="Fresh">
                                <option value="Daily Necessities">
                                <option value="Others">
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label for="product-type">Product Type:</label>
                            <select id="product-type">
                                <option value="Goods">Goods</option>
                                <option value="Service">Service</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Product Description:</label>
                            <textarea id="product-description" placeholder="Enter detailed product description..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="product-image">Image URL (Optional):</label>
                            <input type="url" id="product-image" placeholder="https://example.com/image.jpg">
                        </div>
                        <button type="submit" class="btn btn-primary">Create Product</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
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
        const productData = {
            name: form.querySelector('#product-title').value,
            sales_price: parseFloat(form.querySelector('#product-price').value),
            category: form.querySelector('#product-category').value,
            description: form.querySelector('#product-description').value,
            product_type: form.querySelector('#product-type')?.value || 'Goods',
            sales_tax_rate: '9% SR',
            created_by: 'web_user'
        };

        // If there's an image URL field
        const imageField = form.querySelector('#product-image');
        if (imageField && imageField.value) {
            productData.image = imageField.value;
        }

        try {
            const apiUrl = this.useLocalApi ? this.apiBaseUrl : this.fallbackApiUrl;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const newProduct = await response.json();
                
                // Handle different API formats
                const productToAdd = this.useLocalApi ? newProduct : {
                    ...newProduct,
                    product_id: newProduct.id,
                    name: newProduct.title,
                    sales_price: newProduct.price
                };
                
                this.products.unshift(productToAdd);
                this.filteredProducts = [...this.products];
                this.renderProducts();
                this.showMessage('Product created successfully!', 'success');
            } else {
                throw new Error('Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            this.showMessage('Failed to create product, please try again', 'error');
        }
    }
}

// Initialize product manager
let productManager;
document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});