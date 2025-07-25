# Shopify Product Management App

A Shopify embedded app built with Remix and Polaris for managing products in your Shopify store. Features a clean, responsive interface for viewing and creating products.

## Live Demo
- **Deployment URL:** [https://shopifyproductapp.onrender.com](https://shopifyproductapp.onrender.com)
- **GitHub Repository:** [https://github.com/ZayMinKhant/ShopifyProductApp](https://github.com/ZayMinKhant/ShopifyProductApp)

## Features
- View all products with their details
- Create new products with title and description
- Filter by status (Active/Draft) and stock level
- Sort by title (ascending/descending)
- Search products by title
- Responsive Polaris UI components
- Error handling and notifications

---

## Screenshots
> _Add screenshots or a GIF of your app here for best results._

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- A Shopify Partner account
- A Shopify development store
- Git installed on your machine

### 1. Clone the Repository
```bash
git clone https://github.com/ZayMinKhant/ShopifyProductApp.git
cd ShopifyProductApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products
SHOPIFY_APP_URL=https://your-app.onrender.com
```

### 4. Shopify App Configuration
Edit `shopify.app.toml` to match your app’s URL and credentials.

> **Note:** If you want to test the app in development, you may need to update `shopify.app.toml` to reflect your local tunnel (e.g., ngrok) or dev server URL, and ensure the allowed redirect URLs match your development environment. This is required for Shopify to correctly redirect and embed your app during local testing. You can update 'automatically_update_urls_on_dev = false' to 'true' easily.

### 5. Database Setup (Prisma)
```bash
npm run setup
```

### 6. Local Development
```bash
npm run dev
```

---

## API Endpoints

### `GET /api/products`
- Fetches up to 50 products from the Shopify Admin API.
- Returns: `[{ id, title, status, price, image, inventoryQuantity }]` (price is from the first variant, if available)

### `POST /api/products`
- Creates a new product with required title and optional description
- Body: `FormData` with:
  - `title` (required): Product title (min 2 characters)
  - `description` (optional): Product description
- Returns: 
  - Success: `{ success: true, product, message }`
  - Error: `{ success: false, error }`

---

## Tech Stack
- **Frontend:**
  - React with Remix
  - Shopify Polaris UI components
  - GraphQL for API communication
- **Backend:**
  - Remix server
  - Prisma for database management
  - Shopify Admin API integration
- **Development:**
  - TypeScript for type safety
  - ESLint for code quality
  - Prettier for code formatting

## Error Handling
- Frontend form validation
- Backend data validation
- GraphQL error handling
- User-friendly error messages
- Network error handling

---

## Deployment Guide

### Deploying to Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the following settings:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Auto-Deploy:** Yes

4. Add environment variables:
   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=read_products,write_products
   SHOPIFY_APP_URL=https://your-app.onrender.com
   SHOPIFY_DOMAIN=your-store
   ```

5. Deploy the app and wait for the build to complete

### Post-Deployment Steps

1. Update your Shopify app settings with the new URL
2. Test the app installation flow
3. Verify product management functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting
- **Common issues and solutions:**
  - See the [Shopify Remix template README](https://github.com/Shopify/shopify-app-template-remix) for more.
  - Ensure your `.env` and `shopify.app.toml` are correct.
  - Prisma errors? Run `npm run setup`.

## License
MIT
