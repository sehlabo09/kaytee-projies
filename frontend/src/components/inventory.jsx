import React, { useEffect, useState } from "react";

export default function InventoryTable() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("https://kaytee-projies.onrender.com/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }

  async function updateQuantity(id, delta) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newQuantity = product.quantity + delta;
    if (newQuantity < 0) return; // prevent negative stock

    try {
      await fetch(`https://kaytee-projies.onrender.com/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, quantity: newQuantity }),
      });
      loadProducts();
    } catch (error) {
      console.error(" Failed to update product:", error);
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="header-row">
        <h1>Inventory</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>

      {filtered.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={p.quantity <= LOW_STOCK_THRESHOLD ? "low-stock" : ""}
                >
                  <td>
                    <img
                      src={p.image || "https://via.placeholder.com/80"}
                      alt={p.name}
                      className="product-img"
                      style={{ width: "60px", borderRadius: "8px" }}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.description || "No description available."}</td>
                  <td>R{Number(p.price).toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td
                    className={p.quantity > 0 ? "available" : "not-available"}
                    style={{ fontWeight: "600" }}
                  >
                    {p.quantity > 0 ? "Available" : "Out of Stock"}
                  </td>
                  <td>
                    <button
                      className="btn small"
                      onClick={() => updateQuantity(p.id, 1)}
                    >
                      + Add Stock
                    </button>
                    <button
                      className="btn small outline"
                      onClick={() => updateQuantity(p.id, -1)}
                      disabled={p.quantity === 0}
                    >
                      - Remove Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
