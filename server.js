const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all products (with optional search and category filter)
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push("(name LIKE ? OR sku LIKE ? OR description LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY name ASC';

  const products = db.prepare(query).all(...params);
  res.json(products);
});

// GET distinct categories
app.get('/api/categories', (req, res) => {
  const categories = db
    .prepare('SELECT DISTINCT category FROM products ORDER BY category ASC')
    .all()
    .map((r) => r.category);
  res.json(categories);
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST create product
app.post('/api/products', (req, res) => {
  const { name, category, sku, price, quantity, description } = req.body;
  if (!name || !category || !sku || price == null || quantity == null) {
    return res.status(400).json({ error: 'name, category, sku, price, and quantity are required' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO products (name, category, sku, price, quantity, description) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, category, sku, Number(price), Number(quantity), description || '');
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A product with that SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { name, category, sku, price, quantity, description } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  try {
    db.prepare(
      `UPDATE products SET name=?, category=?, sku=?, price=?, quantity=?, description=? WHERE id=?`
    ).run(
      name ?? existing.name,
      category ?? existing.category,
      sku ?? existing.sku,
      price != null ? Number(price) : existing.price,
      quantity != null ? Number(quantity) : existing.quantity,
      description ?? existing.description,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A product with that SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted', id: Number(req.params.id) });
});

// Serve frontend for any unmatched route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Inventory app running at http://localhost:${PORT}`);
});

module.exports = app;
