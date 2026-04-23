# RetroVault — 8-Bit Inventory Manager

A modern web app for managing the inventory of an 8-bit retro games store.
Browse, add, edit, and delete products across categories like **Consoles**, **Handhelds**, **Games**, **Controllers**, and **Accessories** — all pre-loaded with 20 classic 8-bit era items.

## Features

- 📦 Browse products in grid or list view
- 🔍 Search by name, SKU, or description
- 🗂 Filter by category
- ➕ Add new products via a modal form
- ✏️ Edit any product (name, price, quantity, …)
- ±  Adjust quantities directly with inline +/− steppers
- 🗑 Delete products with a confirmation prompt
- 📊 Live stats bar (total products, categories, units, low-stock count)
- 💾 SQLite database — no external DB server needed
- 🎮 Dark arcade theme with neon accents and pixel-font branding

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Node.js + Express.js              |
| Database | SQLite via `better-sqlite3`       |
| Frontend | Vanilla HTML / CSS / JavaScript   |

## Quick Start

```bash
# Install dependencies
npm install

# Start the server (seeds the DB on first run)
npm start
```

Then open **http://localhost:3000** in your browser.

Set a custom port with the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## API Endpoints

| Method | Path                  | Description               |
|--------|-----------------------|---------------------------|
| GET    | `/api/products`       | List products (search/filter via query params) |
| GET    | `/api/products/:id`   | Get a single product      |
| POST   | `/api/products`       | Create a product          |
| PUT    | `/api/products/:id`   | Update a product          |
| DELETE | `/api/products/:id`   | Delete a product          |
| GET    | `/api/categories`     | List distinct categories  |

### Query parameters for `GET /api/products`

| Param      | Description                      |
|------------|----------------------------------|
| `search`   | Full-text search (name/SKU/desc) |
| `category` | Filter by exact category name    |
