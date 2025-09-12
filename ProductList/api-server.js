// Simple local API server for product management
// Run with: node api-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Sample product data
let products = [
    {
        id: 1,
        title: "Fresh Organic Apples",
        price: 4.99,
        category: "fruits",
        description: "Fresh organic apples from local farms. Sweet and crispy, perfect for snacks or baking.",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300",
        rating: { rate: 4.5, count: 120 }
    },
    {
        id: 2,
        title: "Whole Grain Bread",
        price: 3.49,
        category: "bakery",
        description: "Freshly baked whole grain bread with seeds and nuts. Perfect for healthy sandwiches.",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
        rating: { rate: 4.2, count: 85 }
    },
    {
        id: 3,
        title: "Organic Milk",
        price: 5.99,
        category: "dairy",
        description: "Fresh organic milk from grass-fed cows. Rich in nutrients and delicious taste.",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300",
        rating: { rate: 4.7, count: 200 }
    },
    {
        id: 4,
        title: "Free Range Eggs",
        price: 6.99,
        category: "dairy",
        description: "Farm fresh free-range eggs from happy chickens. Perfect for breakfast or baking.",
        image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=300",
        rating: { rate: 4.8, count: 150 }
    },
    {
        id: 5,
        title: "Fresh Salmon Fillet",
        price: 18.99,
        category: "seafood",
        description: "Premium fresh salmon fillet, rich in omega-3 fatty acids. Perfect for grilling or baking.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300",
        rating: { rate: 4.6, count: 75 }
    }
];

// CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Handle HTTP requests
function handleRequest(req, res) {
    setCorsHeaders(res);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;
    
    // Set content type to JSON
    res.setHeader('Content-Type', 'application/json');

    try {
        if (pathname === '/products' || pathname === '/api/products') {
            handleProductsRoute(req, res);
        } else if (pathname.match(/^\/products\/\d+$/) || pathname.match(/^\/api\/products\/\d+$/)) {
            const productId = parseInt(pathname.split('/').pop());
            handleSingleProductRoute(req, res, productId);
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function handleProductsRoute(req, res) {
    switch (req.method) {
        case 'GET':
            res.writeHead(200);
            res.end(JSON.stringify(products));
            break;
            
        case 'POST':
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const newProduct = JSON.parse(body);
                    newProduct.id = Math.max(...products.map(p => p.id)) + 1;
                    newProduct.rating = newProduct.rating || { rate: 0, count: 0 };
                    products.push(newProduct);
                    
                    res.writeHead(201);
                    res.end(JSON.stringify(newProduct));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
}

function handleSingleProductRoute(req, res, productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    
    switch (req.method) {
        case 'GET':
            if (productIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Product not found' }));
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(products[productIndex]));
            }
            break;
            
        case 'PUT':
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    if (productIndex === -1) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Product not found' }));
                        return;
                    }
                    
                    const updatedProduct = JSON.parse(body);
                    updatedProduct.id = productId;
                    products[productIndex] = { ...products[productIndex], ...updatedProduct };
                    
                    res.writeHead(200);
                    res.end(JSON.stringify(products[productIndex]));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            break;
            
        case 'DELETE':
            if (productIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Product not found' }));
            } else {
                products.splice(productIndex, 1);
                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Product deleted successfully' }));
            }
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
}

// Create server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET    /api/products       - Get all products');
    console.log('  POST   /api/products       - Create new product');
    console.log('  GET    /api/products/:id   - Get product by ID');
    console.log('  PUT    /api/products/:id   - Update product by ID');
    console.log('  DELETE /api/products/:id   - Delete product by ID');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
