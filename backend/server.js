const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/products", (req, res) => {
  res.json(readDB().products);
});

app.post("/api/products", (req, res) => {
  const db = readDB();
  const newProduct = { id: Date.now().toString(), ...req.body };
  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  db.products[idx] = { ...db.products[idx], ...req.body };
  writeDB(db);
  res.json(db.products[idx]);
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  writeDB(db);
  res.json({ message: "Product deleted" });
});

app.get("/api/transactions", (req, res) => {
  res.json(readDB().transactions);
});

app.post("/api/transactions", (req, res) => {
  const { productId, name, price, quantity } = req.body;

  if (!productId || !quantity || !name || !price) {
    return res.status(400).json({ error: "Missing transaction fields" });
  }

  const db = readDB();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (product.quantity < quantity) {
    return res.status(400).json({ error: "Not enough stock" });
  }

  // Deduct stock safely
  product.quantity -= quantity;

  // Record transaction
  const transaction = {
    id: Date.now().toString() + Math.floor(Math.random() * 1000), 
    productId,
    name,
    quantity,
    price,
    subtotal: price * quantity, 
    date: new Date().toISOString(),
  };

  db.transactions.push(transaction);
  writeDB(db);

  res.status(201).json(transaction);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
