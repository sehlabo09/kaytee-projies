import React, { useEffect, useState } from "react";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }

  function addToCart(product) {
    if (product.quantity <= 0) return alert("Out of stock");

    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity)
        setCart(
          cart.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      else alert("Cannot add more than stock");
    } else setCart([...cart, { ...product, quantity: 1 }]);
  }

  function removeFromCart(productId) {
    setCart(cart.filter((p) => p.id !== productId));
  }

  function updateCartQuantity(productId, delta) {
    const product = cart.find((p) => p.id === productId);
    if (!product) return;

    const stock = products.find((p) => p.id === productId)?.quantity || 0;
    const newQty = product.quantity + delta;

    if (newQty <= 0) removeFromCart(productId);
    else if (newQty <= stock)
      setCart(cart.map((p) => (p.id === productId ? { ...p, quantity: newQty } : p)));
    else alert("Cannot exceed stock");
  }

  // **Corrected Checkout**
  async function checkout() {
    if (cart.length === 0) return alert("Cart is empty");

    try {
      for (let item of cart) {
        const product = products.find((p) => p.id === item.id);
        if (!product || product.quantity < item.quantity)
          return alert(`Not enough stock for ${item.name}`);

        const res = await fetch("http://localhost:5000/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          return alert(`Failed to record transaction for ${item.name}: ${err.error}`);
        }
      }

      setCart([]);
      await loadProducts();
      alert("Sale completed and recorded!");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error recording sale. Check server console.");
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page">
      <h1>Sales</h1>

      <div className="product-grid">
        {products.map((p) => (
          <div
            key={p.id}
            className={`product-card ${p.quantity <= LOW_STOCK_THRESHOLD ? "low-stock" : ""}`}
          >
            {p.quantity <= LOW_STOCK_THRESHOLD && <span>Almost Out!</span>}
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>R{p.price.toFixed(2)}</p>
            <p>Stock: {p.quantity}</p>
            <button onClick={() => addToCart(p)} disabled={p.quantity === 0}>
              {p.quantity === 0 ? "Out of Stock" : "Add to Sale"}
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div>
          <h2>Current Sale</h2>
          <table>
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
                    <button onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                    <button onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <strong>Total: R{total.toFixed(2)}</strong>
          <button onClick={checkout}>Checkout</button>
        </div>
      )}
    </div>
  );
}
