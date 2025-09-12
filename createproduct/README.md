# Product Creation System

A modern web interface for creating and managing products with full backend integration.

## Features

- **Complete Product Form**: All fields from the backend API schema
- **Real-time Validation**: Client-side validation with immediate feedback
- **Auto-calculation**: Automatic tax-inclusive price calculation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **API Integration**: Direct communication with FastAPI backend
- **User-friendly Interface**: Clean, modern design with proper error handling

## Setup Instructions

### 1. Backend Setup
Make sure your FastAPI backend is running:
```bash
cd /home/zyh/learn/NUS/Design/backend
python main.py
```
The backend should be accessible at `http://localhost:8000`

### 2. Frontend Setup
Open the `index.html` file in a web browser, or serve it using a local server:

```bash
# Option 1: Simple Python server
cd /home/zyh/learn/NUS/Design/createproduct
python -m http.server 3000

# Option 2: Node.js server (if you have Node.js)
npx serve .

# Option 3: Just open the file
# Double-click index.html or open it directly in your browser
```

### 3. Configuration
If your backend is running on a different URL, update the `API_BASE_URL` in `global.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:port';
```

## Form Fields

The form includes all fields supported by the backend API:

### Required Fields
- **Product Name**: The name of your product (required)

### Basic Information
- **Product Description**: Detailed description of the product
- **Product Type**: Goods, Service, or Digital
- **Category**: Product category (e.g., Electronics, Clothing)

### Pricing Information
- **Sales Price**: Base selling price
- **Cost**: Product cost
- **Sales Tax Rate**: Tax rate for sales (e.g., "9% SR")
- **Purchase Tax Rate**: Tax rate for purchases (e.g., "9% TX")
- **Sales Price (Including Tax)**: Auto-calculated based on sales price and tax rate

### Additional Information
- **Reference/SKU**: Product reference or stock keeping unit
- **Barcode**: Product barcode
- **Invoicing Policy**: How the product should be invoiced
- **Internal Notes**: Notes for internal team reference
- **Created By**: Name of the person creating the product

## Features

### Auto-calculation
The system automatically calculates the tax-inclusive price when you enter:
- Sales price
- Sales tax rate

### Form Validation
- Required field validation
- Number format validation for prices
- Maximum length validation for text fields
- Negative number prevention for prices

### API Communication
- Automatic form submission to backend
- Error handling with user-friendly messages
- Success notifications
- Loading states during API calls

### Responsive Design
- Mobile-friendly navigation
- Responsive form layout
- Touch-friendly buttons and inputs

## API Endpoints Used

- `POST /products` - Create new product
- `GET /health` - Check API health (optional)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Backend Connection Issues
1. Make sure the backend is running on `http://localhost:8000`
2. Check the browser console for CORS errors
3. Verify the API_BASE_URL in `global.js`

### Form Submission Issues
1. Check browser console for JavaScript errors
2. Verify all required fields are filled
3. Ensure backend is accessible and healthy

### Styling Issues
1. Check that all CSS files are loading properly
2. Verify font resources are accessible
3. Check for any CSS conflicts

## Development

### File Structure
```
createproduct/
├── index.html          # Main HTML page
├── global.css          # Global styles and variables
├── global.js           # JavaScript functionality
├── README.md           # This file
└── images/             # Image assets
```

### Customization
- Colors and fonts can be modified in `global.css` using CSS custom properties
- Form validation rules can be adjusted in `global.js`
- Additional fields can be added by updating both HTML and JavaScript

## License

This project is part of the NUS Design coursework.
