import React, { useEffect, useState } from "react";

export default function Report({ refreshSignal }) {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

  // Fetch products and transactions
  async function loadData() {
    try {
      const [prodRes, txRes] = await Promise.all([
        fetch("https://kaytee-projies.onrender.com/api/products"),
        fetch("https://kaytee-projies.onrender.com/api/transactions")
      ]);

      setProducts(await prodRes.json());
      setTransactions(await txRes.json());
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, [refreshSignal]);

  const filteredTx = transactions.filter(tx => tx.date.startsWith(dateFilter));

  // Compute totals
  const totalRevenue = filteredTx.reduce((sum, tx) => sum + tx.subtotal, 0);
  const totalItemsSold = filteredTx.reduce((sum, tx) => sum + tx.quantity, 0);

  // Top-selling products
  const salesMap = {};
  filteredTx.forEach(tx => { salesMap[tx.name] = (salesMap[tx.name] || 0) + tx.quantity; });
  const topProducts = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Low-stock products
  const LOW_STOCK_THRESHOLD = 5;
  const lowStockProducts = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);

  return (
    <div className="page">
      <div className="header-row">
        <h1>Daily Report</h1>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      <div className="cards">
        <div className="card"><h3>Total Revenue</h3><p>R{totalRevenue.toFixed(2)}</p></div>
        <div className="card"><h3>Total Items Sold</h3><p>{totalItemsSold}</p></div>
        <div className="card"><h3>Total Transactions</h3><p>{filteredTx.length}</p></div>
        <div className="card"><h3>Low Stock</h3><p>{lowStockProducts.length}</p></div>
      </div>

      <h2>Top-Selling Products</h2>
      {topProducts.length === 0 ? (
        <p>No sales</p>
      ) : (
        <ul>{topProducts.map(([name, qty], i) => <li key={i}>{name} - {qty} sold</li>)}</ul>
      )}

      <h2>Transactions</h2>
      {filteredTx.length === 0 ? (
        <p>No transactions today.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map(tx => (
              <tr key={tx.id}>
                <td>{tx.name}</td>
                <td>{tx.quantity}</td>
                <td>R{tx.price.toFixed(2)}</td>
                <td>R{tx.subtotal.toFixed(2)}</td>
                <td>{new Date(tx.date).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {lowStockProducts.length > 0 && (
        <>
          <h2>Low Stock Products</h2>
          <ul>{lowStockProducts.map(p => <li key={p.id}>{p.name} - {p.quantity} left</li>)}</ul>
        </>
      )}
    </div>
  );
}
