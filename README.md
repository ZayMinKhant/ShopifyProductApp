# Shopify Product Management App
## Core Features

### Product Management

- View all products with their details
- Create new products with title and description
- Future support for pricing, inventory, and images

### List Management

- Filter by status (Active/Draft)
- Sort by title (ascending/descending)
- Search products by title

### User Experience

- Responsive Polaris UI components
- Real-time form validation
- Error handling and notifications
- Loading and empty states embedded app built with Remix and Polaris that allows you to manage products in your Shopify store. The app provides a clean, responsive interface for viewing and creating products, with features like filtering, sorting, and search capabilities.

## Live Demo
- **Deployment URL:** [https://shopifyproductapp.onrender.com](https://shopifyproductapp.onrender.com)
- **GitHub Repository:** [https://github.com/ZayMinKhant/ShopifyProductApp](https://github.com/ZayMinKhant/ShopifyProductApp)

## Features

- **Product Management:**
  - View all products with their details
  - Create new products with title and description
  - Future support for pricing, inventory, and images
- **List Features:**
  - Filter by status (Active/Draft) and stock level
  - Sort by title (ascending/descending)
  - Search products by title
- **User Experience:**
  - Responsive Polaris UI components
  - Real-time validation
  - Error handling and notifications
  - Loading states and empty statest Listing App

# Shopify Product Management App

A Shopify embedded app built with Remix and Polaris for managing products in your Shopify store. Features a clean, responsive interface for viewing and creating products.

## Project Links

- **Live Demo:** [https://your-app.onrender.com](https://your-app.onrender.com)
- **Repository:** [https://github.com/ZayMinKhant/ShopifyProductApp](https://github.com/ZayMinKhant/ShopifyProductApp)

## Core Features

- **Product Listing:** Fetches and displays products from your Shopify store using the Admin API.
- **Responsive UI:** Built with Shopify Polaris for a native Shopify admin experience.
- **Filtering:** Filter products by status (Active/Draft) and stock (In Stock/Out of Stock).
- **Sorting:** Sort products by title or price (ascending/descending).
- **Search:** Search products by title.
- **Product Creation:** Create new products directly from the UI.
- **Error Handling:** User-friendly error and empty states.
- **Toast Notifications:** Feedback for product creation and errors.

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

### 5. Database Setup (Prisma)
```bash
npm run setup
```

### 6. Local Development
```bash
npm run dev
```

---

## Dynamic Shop Domain

**Note:** The app now reads the shop domain dynamically from the URL query string. To use the app for a specific shop, include the `shop` parameter in the URL, for example:

```
https://your-app.onrender.com/app?shop=myshopdomain
```

- The `shop` value will be used to generate Shopify admin links and for shop-specific logic in the frontend.
- The environment variable `VITE_SHOP_DOMAIN` is no longer used in the frontend code for determining the shop domain.

---

## API Endpoints

### `GET /api/products`
- Fetches up to 50 products from the Shopify Admin API.
- Returns: `[{ id, title, status, price, image, inventoryQuantity }]`

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

## License

This project is licensed under the MIT License - see the LICENSE file for details
   git push -u origin main
   ```
2. **Create a Render.com Web Service**
   - Connect your GitHub repo
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables from your `.env`
   - Deploy
3. **Update Shopify App Settings**
   - Set `SHOPIFY_APP_URL` and redirect URLs in your Partner Dashboard to your Render.com URL

---

## Bonus Features
- Filter by availability and status
- Sort by price and title
- Product creation with UI
- Search functionality
- Toast notifications

---

## Submission
- **GitHub Repo:** [yourusername/product-app](https://github.com/yourusername/product-app)
- **Live App:** [your-app.onrender.com](https://your-app.onrender.com)
- **README:** Includes setup, usage, and deployment instructions

---

## Tech Stack
- [Remix](https://remix.run/)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge)
- [Prisma](https://www.prisma.io/)
- [Render.com](https://render.com/)

---

## Troubleshooting
- **Common issues and solutions:**
  - See the [Shopify Remix template README](https://github.com/Shopify/shopify-app-template-remix) for more.
  - Ensure your `.env` and `shopify.app.toml` are correct.
  - Prisma errors? Run `npm run setup`.

---

## License
MIT
