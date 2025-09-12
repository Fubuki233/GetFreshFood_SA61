/**
 * Product Creation System
 * Handles form submission and API communication
 */

// API Configuration
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL
const API_ENDPOINTS = {
    products: '/products',
    health: '/health'
};

// DOM Elements
let form, messageContainer, message;

// Global error handler
window.addEventListener('error', function (event) {
    console.error('Global error caught:', event.error);
    console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent the default handler
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeApplication();
});

/**
 * Initialize the application
 */
function initializeApplication() {
    try {
        console.log('Starting product creation system initialization...');

        // Get DOM elements
        form = document.getElementById('product-form');
        messageContainer = document.getElementById('message-container');
        message = document.getElementById('message');

        // Check if required elements exist
        if (!form) {
            console.error('Product form element not found!');
            return;
        }

        if (!messageContainer || !message) {
            console.warn('Message container elements not found - some features may not work');
        }

        // Set up event listeners
        setupEventListeners();

        // Auto-calculate tax-inclusive price
        setupPriceCalculation();

        console.log('Product creation system initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('System initialization failed. Please refresh the page.', 'error');
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }

    // Mobile navigation toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileNav);
    }
}

/**
 * Set up automatic price calculation
 */
function setupPriceCalculation() {
    const salesPriceInput = document.getElementById('sales-price');
    const taxRateInput = document.getElementById('sales-tax-rate');
    const inclTaxInput = document.getElementById('sales-price-incl-tax');

    function calculateInclusivePrice() {
        const salesPrice = parseFloat(salesPriceInput.value) || 0;
        const taxRateText = taxRateInput.value.trim();

        if (salesPrice > 0 && taxRateText) {
            // Extract percentage from tax rate (e.g., "9% SR" -> 9)
            const taxMatch = taxRateText.match(/(\d+(?:\.\d+)?)/);
            if (taxMatch) {
                const taxRate = parseFloat(taxMatch[1]) / 100;
                const inclusivePrice = salesPrice * (1 + taxRate);
                inclTaxInput.value = inclusivePrice.toFixed(2);
            }
        } else {
            inclTaxInput.value = '';
        }
    }

    if (salesPriceInput && taxRateInput && inclTaxInput) {
        salesPriceInput.addEventListener('input', calculateInclusivePrice);
        taxRateInput.addEventListener('input', calculateInclusivePrice);
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    console.log('Form submission started...');

    // Show loading message
    showMessage('Creating product...', 'loading');

    // Disable submit button
    const submitBtn = form.querySelector('.btn-create');
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    try {
        // Collect form data
        const productData = collectFormData();
        console.log('Collected product data:', productData);

        // Validate required fields
        if (!validateFormData(productData)) {
            console.log('Form validation failed');
            return;
        }

        console.log('Sending data to API...');
        // Send to API
        const response = await createProduct(productData);
        console.log('API response:', response);

        if (response && response.success !== false) {
            showMessage('Product created successfully!', 'success');
            resetForm();
        } else {
            const errorMsg = response && response.message ? response.message : 'Unknown error occurred';
            showMessage(`Error: ${errorMsg}`, 'error');
        }

    } catch (error) {
        console.error('Error creating product:', error);
        const errorMessage = error && error.message ? error.message : 'Unknown error occurred';
        showMessage(`Error: ${errorMessage}`, 'error');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        console.log('Form submission completed');
    }
}

/**
 * Collect data from form
 */
function collectFormData() {
    const formData = new FormData(form);
    const data = {};

    // Convert FormData to object, handling empty strings and numbers
    for (const [key, value] of formData.entries()) {
        if (value.trim() === '') {
            data[key] = null;
        } else if (key.includes('price') || key === 'cost') {
            // Convert price fields to numbers
            const numValue = parseFloat(value);
            data[key] = isNaN(numValue) ? null : numValue;
        } else {
            data[key] = value.trim();
        }
    }

    return data;
}

/**
 * Validate form data
 */
function validateFormData(data) {
    if (!data.name) {
        showMessage('Product name is required', 'error');
        document.getElementById('product-name').focus();
        return false;
    }

    if (data.name.length > 255) {
        showMessage('Product name must be less than 255 characters', 'error');
        document.getElementById('product-name').focus();
        return false;
    }

    // Validate price fields if provided
    if (data.sales_price !== null && data.sales_price < 0) {
        showMessage('Sales price cannot be negative', 'error');
        document.getElementById('sales-price').focus();
        return false;
    }

    if (data.cost !== null && data.cost < 0) {
        showMessage('Cost cannot be negative', 'error');
        document.getElementById('cost').focus();
        return false;
    }

    return true;
}

/**
 * Create product via API
 */
async function createProduct(productData) {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.products}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Show message to user
 */
function showMessage(text, type = 'info') {
    // Fallback for console if message elements don't exist
    if (!messageContainer || !message) {
        console.log(`[${type.toUpperCase()}] ${text}`);

        // Try to create a simple alert for critical messages
        if (type === 'error') {
            alert(`Error: ${text}`);
        } else if (type === 'success') {
            alert(`Success: ${text}`);
        }
        return;
    }

    try {
        message.textContent = text || 'Unknown message';
        message.className = `message ${type}`;
        messageContainer.style.display = 'block';

        console.log(`[${type.toUpperCase()}] ${text}`);

        // Auto-hide after 5 seconds for success/error messages
        if (type !== 'loading') {
            setTimeout(() => {
                if (messageContainer) {
                    messageContainer.style.display = 'none';
                }
            }, 5000);
        }
    } catch (error) {
        console.error('Error showing message:', error);
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
}

/**
 * Reset form to initial state
 */
function resetForm() {
    if (form) {
        form.reset();
        // Clear calculated tax-inclusive price
        const inclTaxInput = document.getElementById('sales-price-incl-tax');
        if (inclTaxInput) {
            inclTaxInput.value = '';
        }
    }
}

/**
 * Handle cancel button click
 */
function handleCancel() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        resetForm();
        // Optionally redirect to products list or dashboard
        // window.location.href = '/products';
    }
}

/**
 * Toggle mobile navigation
 */
function toggleMobileNav() {
    const nav = document.querySelector('.main-nav');
    if (nav) {
        nav.classList.toggle('mobile-open');
    }
}

/**
 * Check API health (optional utility function)
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
        const data = await response.json();
        console.log('API Health:', data);
        return data.status === 'healthy';
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

// Export functions for testing if needed (Node.js environment only)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        collectFormData,
        validateFormData,
        createProduct,
        showMessage,
        checkAPIHealth
    };
}