# Shopify Product Listing App

A Shopify embedded app built with Remix and Polaris that fetches products from the Shopify Admin API, displays them in a clean, responsive UI, and allows product creation—all deployable on Render.com’s free tier.

---

## Features

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
- Node.js 18+
- Shopify Partner account
- Shopify development store

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/product-app.git
cd product-app
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
VITE_SHOP_DOMAIN=your-store
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

## API Endpoints

### `GET /api/products`
- Fetches up to 50 products from the Shopify Admin API.
- Returns: `[{ id, title, status, price, image, inventoryQuantity }]`

### `POST /api/products`
- Creates a new product with title, price, and description.
- Body: `FormData` with `title`, `price`, `description` (optional)
- Returns: `{ success, product }` or `{ error }`

---

## UI Features
- **ResourceList**: Displays products with title, price, image, status, and stock.
- **Filters**: By status and stock.
- **Sort**: By title or price.
- **Search**: By product title.
- **Modal**: For product creation.
- **Toast**: For feedback.
- **Responsive**: Works on all devices.

---

## Deployment (Render.com)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/product-app.git
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
