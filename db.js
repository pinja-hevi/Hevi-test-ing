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
    // ── Consoles ──────────────────────────────────────────────────────────────
    { name: 'Nintendo Entertainment System (NES)', category: 'Consoles', sku: 'CON-NES-001', price: 89.99, quantity: 12, description: 'The iconic 8-bit home console (1983). Includes power adapter and RF cable.' },
    { name: 'Sega Master System II', category: 'Consoles', sku: 'CON-SMS-001', price: 74.99, quantity: 8, description: "Sega's 8-bit rival to the NES (1987). Built-in Alex Kidd in Miracle World." },
    { name: 'Atari 2600 (4-Switch)', category: 'Consoles', sku: 'CON-AT2-001', price: 59.99, quantity: 6, description: 'The legendary Atari 2600 (1977). Includes joystick and power supply.' },
    { name: 'ColecoVision', category: 'Consoles', sku: 'CON-COL-001', price: 69.99, quantity: 4, description: 'Coleco\'s 8-bit powerhouse (1982) famed for arcade-accurate ports.' },
    { name: 'Atari 7800 ProSystem', category: 'Consoles', sku: 'CON-AT7-001', price: 64.99, quantity: 5, description: '8-bit Atari 7800 (1986), backward-compatible with Atari 2600 cartridges.' },
    // ── Handhelds ─────────────────────────────────────────────────────────────
    { name: 'Game Boy (Original DMG-01)', category: 'Handhelds', sku: 'HND-GBO-001', price: 54.99, quantity: 15, description: "Nintendo's original Game Boy (1989). 8-bit handheld that defined portable gaming." },
    { name: 'Atari Lynx (Mark I)', category: 'Handhelds', sku: 'HND-LNX-001', price: 44.99, quantity: 7, description: 'The first colour handheld console (1989). Powerful 8-bit hardware by Atari.' },
    // ── NES Games ─────────────────────────────────────────────────────────────
    { name: 'Super Mario Bros. (NES)', category: 'Games', sku: 'GAM-NES-001', price: 24.99, quantity: 20, description: 'The genre-defining 1985 platformer. Cartridge only, good label.' },
    { name: 'The Legend of Zelda (NES)', category: 'Games', sku: 'GAM-NES-002', price: 32.99, quantity: 14, description: 'Epic 1986 action-adventure on gold cartridge. Cartridge only.' },
    { name: 'Mega Man 2 (NES)', category: 'Games', sku: 'GAM-NES-003', price: 22.99, quantity: 11, description: "Capcom's 1988 masterpiece — widely considered the best Mega Man game." },
    { name: 'Contra (NES)', category: 'Games', sku: 'GAM-NES-004', price: 19.99, quantity: 16, description: 'Classic 1988 run-and-gun. Up Up Down Down... Cartridge only.' },
    { name: 'Metroid (NES)', category: 'Games', sku: 'GAM-NES-005', price: 21.99, quantity: 9, description: "Nintendo's 1986 atmospheric sci-fi adventure on a grey cartridge." },
    // ── Sega Master System Games ───────────────────────────────────────────────
    { name: 'Sonic the Hedgehog (Master System)', category: 'Games', sku: 'GAM-SMS-001', price: 18.99, quantity: 13, description: "Sega's 8-bit Sonic (1991). Unique levels distinct from the Mega Drive version." },
    { name: 'Alex Kidd in Miracle World (SMS)', category: 'Games', sku: 'GAM-SMS-002', price: 16.99, quantity: 10, description: "Sega's flagship 8-bit platformer (1986). Cartridge with original case." },
    // ── Atari 2600 Games ──────────────────────────────────────────────────────
    { name: 'Pitfall! (Atari 2600)', category: 'Games', sku: 'GAM-AT2-001', price: 13.99, quantity: 18, description: "Activision's 1982 jungle platformer — a groundbreaking home game of its era." },
    { name: 'Pac-Man (Atari 2600)', category: 'Games', sku: 'GAM-AT2-002', price: 9.99, quantity: 22, description: 'The 1982 Atari port of the iconic arcade classic. Cartridge only.' },
    // ── Game Boy Games ─────────────────────────────────────────────────────────
    { name: 'Tetris (Game Boy)', category: 'Games', sku: 'GAM-GBO-001', price: 17.99, quantity: 25, description: 'The puzzle game that shipped with every Game Boy (1989). Cartridge only.' },
    { name: 'Pokémon Red Version (Game Boy)', category: 'Games', sku: 'GAM-GBO-002', price: 37.99, quantity: 7, description: 'Original 1996 Pokémon Red on Game Boy. Battery may need replacing.' },
    // ── Controllers ───────────────────────────────────────────────────────────
    { name: 'NES Controller (OEM)', category: 'Controllers', sku: 'CTL-NES-001', price: 19.99, quantity: 30, description: 'Official Nintendo rectangular NES controller. Fully tested.' },
    // ── Accessories ───────────────────────────────────────────────────────────
    { name: 'Universal 8-bit Cartridge Cleaning Kit', category: 'Accessories', sku: 'ACC-CLN-001', price: 12.99, quantity: 40, description: 'Cleaning kit with solution and swabs for NES, SMS, Atari, and Game Boy carts.' },
  ]);
}

module.exports = db;
