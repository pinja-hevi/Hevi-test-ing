const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

const count = db.prepare('SELECT COUNT(*) as cnt FROM products').get();
if (count.cnt === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, sku, price, quantity, description)
    VALUES (@name, @category, @sku, @price, @quantity, @description)
  `);

  const seed = db.transaction((products) => {
    for (const p of products) insert.run(p);
  });

  seed([
    { name: 'Wireless Bluetooth Headphones', category: 'Electronics', sku: 'ELEC-001', price: 79.99, quantity: 45, description: 'Over-ear noise-cancelling headphones with 30h battery life' },
    { name: 'USB-C Charging Cable 2m', category: 'Electronics', sku: 'ELEC-002', price: 12.99, quantity: 120, description: 'Braided nylon USB-C to USB-C fast-charging cable' },
    { name: 'Mechanical Keyboard', category: 'Electronics', sku: 'ELEC-003', price: 129.99, quantity: 18, description: 'Tenkeyless mechanical keyboard with Cherry MX switches' },
    { name: 'Running Shoes', category: 'Footwear', sku: 'FOOT-001', price: 89.95, quantity: 32, description: 'Lightweight breathable mesh running shoes' },
    { name: 'Leather Wallet', category: 'Accessories', sku: 'ACCS-001', price: 34.99, quantity: 55, description: 'Slim bifold genuine leather wallet with RFID blocking' },
    { name: 'Stainless Steel Water Bottle', category: 'Kitchen', sku: 'KITC-001', price: 24.99, quantity: 80, description: '1L double-wall insulated water bottle, keeps drinks cold 24h' },
    { name: 'Yoga Mat', category: 'Sports', sku: 'SPRT-001', price: 39.99, quantity: 27, description: 'Non-slip eco-friendly TPE yoga mat, 6mm thick' },
    { name: 'Cotton T-Shirt', category: 'Clothing', sku: 'CLTH-001', price: 19.99, quantity: 150, description: '100% organic cotton unisex t-shirt, available in multiple colors' },
    { name: 'Ceramic Coffee Mug', category: 'Kitchen', sku: 'KITC-002', price: 14.99, quantity: 64, description: '350ml dishwasher-safe ceramic mug with minimalist design' },
    { name: 'Notebook A5', category: 'Stationery', sku: 'STAT-001', price: 8.99, quantity: 200, description: 'Dotted hardcover notebook, 160 pages, lay-flat binding' },
    { name: 'Scented Candle Set', category: 'Home', sku: 'HOME-001', price: 29.99, quantity: 40, description: 'Set of 3 soy wax candles: vanilla, lavender, and sandalwood' },
    { name: 'Sunglasses Polarized', category: 'Accessories', sku: 'ACCS-002', price: 59.99, quantity: 22, description: 'UV400 polarized lens sunglasses with lightweight frame' },
    { name: 'Wireless Mouse', category: 'Electronics', sku: 'ELEC-004', price: 35.99, quantity: 38, description: 'Silent ergonomic wireless mouse, 12-month battery life' },
    { name: 'Denim Jacket', category: 'Clothing', sku: 'CLTH-002', price: 64.99, quantity: 15, description: 'Classic fit denim jacket with distressed wash finish' },
    { name: 'Non-Stick Frying Pan', category: 'Kitchen', sku: 'KITC-003', price: 44.99, quantity: 29, description: '28cm induction-compatible non-stick frying pan' },
    { name: 'Backpack 20L', category: 'Bags', sku: 'BAGS-001', price: 54.99, quantity: 33, description: 'Water-resistant daypack with laptop compartment and USB port' },
    { name: 'Resistance Bands Set', category: 'Sports', sku: 'SPRT-002', price: 22.99, quantity: 60, description: 'Set of 5 latex resistance bands with carry pouch' },
    { name: 'Plant-Based Protein Powder', category: 'Health', sku: 'HLTH-001', price: 39.99, quantity: 50, description: '1kg vanilla-flavored pea protein powder, 25g protein/serving' },
    { name: 'Desk Lamp LED', category: 'Home', sku: 'HOME-002', price: 32.99, quantity: 41, description: 'Adjustable LED desk lamp with 3 colour temperatures and USB port' },
    { name: 'Ballpoint Pen Pack', category: 'Stationery', sku: 'STAT-002', price: 6.99, quantity: 300, description: 'Pack of 10 smooth-writing ballpoint pens, blue ink' },
  ]);
}

module.exports = db;
