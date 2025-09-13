import React, { useEffect, useState } from "react";

// Backend API
const API_BASE_URL = "https://kaytee-projies.onrender.com";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: 0, quantity: 0 });
  const [editing, setEditing] = useState(null);
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      let data = await res.json();

      // Prepend frontend URL to images so they load in production
      data = data.map(p => ({
        ...p,
        image: p.image ? `${window.location.origin}${p.image}` : ""
      }));

      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    try {
      if (editing) {
        await fetch(`${API_BASE_URL}/api/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setEditing(null);
      } else {
        await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setForm({ name: "", price: 0, quantity: 0 });
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  }

  async function deleteProduct(id) {
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  }

  return (
    <div className="page">
      <h1>Products</h1>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.quantity <= LOW_STOCK_THRESHOLD ? "low" : ""}>
                <td>{p.name}</td>
                <td>R{p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button className="btn small" onClick={() => { setForm(p); setEditing(p); }}>Edit</button>
                  <button className="btn small outline" onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form to add/update product */}
      <form onSubmit={saveProduct} className="product-form" style={{ marginTop: "20px" }}>
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
          required
        />
        <div className="form-actions">
          <button type="submit" className="btn">
            {editing ? "Update" : "Add"} Product
          </button>
          {editing && (
            <button
              type="button"
              className="btn outline"
              onClick={() => { setEditing(null); setForm({ name: "", price: 0, quantity: 0 }); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
