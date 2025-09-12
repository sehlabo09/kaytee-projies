import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error("Error loading menu:", err));
  }, []);

  return (
    <div
      className="page menu-page"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1470&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <div className="header-row" style={{ color: "#fffffff9" }}>
        <h1>Menu</h1>
        <p>Choose from our delicious items</p>
      </div>

      <div className="product-grid">
        {products.length === 0 ? (
          <p style={{ color: "white" }}>No items available.</p>
        ) : (
          products.map(p => (
            <div key={p.id} className="product-card menu-card">
              {p.quantity <= 3 && (
                <span className="low-stock-badge">Almost Out!</span>
              )}
              <img
                src={p.image || "https://via.placeholder.com/150"}
                alt={p.name}
                className="product-img"
              />
              <h3>{p.name}</h3>
              <p className="product-desc">{p.description || "No description available."}</p>
              <p className="product-price">R{p.price.toFixed(2)}</p>
              <p className={`availability ${p.quantity > 0 ? "in-stock" : "out-of-stock"}`}>
                {p.quantity > 0 ? `Available (${p.quantity} left)` : "Out of stock"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
