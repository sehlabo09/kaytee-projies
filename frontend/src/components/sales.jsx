import React, { useEffect, useState } from "react";

const API_BASE_URL = "https://kaytee-projies.onrender.com";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    loadProducts();
  }, []);

  // Load products from backend
  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      let data = await res.json();

      // Fix images from public folder
      data = data.map((p) => ({
        ...p,
        image: p.image ? `${window.location.origin}${p.image}` : "",
      }));

      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }

  // Add product to cart
  function addToCart(product) {
    if (product.quantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(
          cart.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      } else {
        alert("Cannot add more than available stock.");
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  // Remove product from cart
  function removeFromCart(productId) {
    setCart(cart.filter((p) => p.id !== productId));
  }

  // Update quantity in cart
  function updateCartQuantity(productId, delta) {
    const product = cart.find((p) => p.id === productId);
    if (!product) return;

    const stock = products.find((p) => p.id === productId)?.quantity || 0;
    const newQuantity = product.quantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= stock) {
      setCart(
        cart.map((p) =>
          p.id === productId ? { ...p, quantity: newQuantity } : p
        )
      );
    } else {
      alert("Cannot exceed available stock.");
    }
  }

  // Checkout
  async function checkout() {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      for (let item of cart) {
        const product = products.find((p) => p.id === item.id);
        if (!product || product.quantity < item.quantity) {
          alert(`Not enough stock for ${item.name}.`);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: String(item.id), // ✅ force string id
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(`Failed to record transaction for ${item.name}: ${err.error}`);
          return;
        }
      }

      setCart([]);
      await loadProducts(); // refresh stock
      alert("Sale completed and recorded!");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error recording the sale.");
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="page">
      <div className="header-row">
        <h1>Sales</h1>
        <p>Sell items and manage inventory</p>
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className={`product-card ${
                p.quantity <= LOW_STOCK_THRESHOLD ? "low-stock" : ""
              }`}
            >
              {p.quantity <= LOW_STOCK_THRESHOLD && (
                <span className="low-stock-badge">Almost Out!</span>
              )}
              <img
                src={p.image || "https://via.placeholder.com/150"}
                alt={p.name}
                className="product-img"
              />
              <h3>{p.name}</h3>
              <p className="product-desc">
                {p.description || "No description available."}
              </p>
              <p className="product-price">R{p.price.toFixed(2)}</p>
              <p className="product-quantity">Stock: {p.quantity}</p>
              <button
                className="btn"
                onClick={() => addToCart(p)}
                disabled={p.quantity === 0}
              >
                {p.quantity === 0 ? "Out of Stock" : "Add to Sale"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cart / Sale Summary */}
      <div className="header-row" style={{ marginTop: "30px" }}>
        <h2>Current Sale</h2>
      </div>

      {cart.length === 0 ? (
        <p>No items in sale.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>R{item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>R{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn small"
                      onClick={() => updateCartQuantity(item.id, 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn small outline"
                      onClick={() => updateCartQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <button
                      className="btn small outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <strong>Total: R{total.toFixed(2)}</strong>
            <button
              className="btn"
              onClick={checkout}
              style={{ marginLeft: "12px" }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
