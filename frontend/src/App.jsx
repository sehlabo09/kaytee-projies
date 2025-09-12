import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/dashboard";
import Products from "./components/products";
import Inventory from "./components/inventory";
import Reports from "./components/reports";
import Sales from "./components/sales";

export default function App() {
  const [refreshReport, setRefreshReport] = useState(0);

  const handleSaleCompleted = () => setRefreshReport(prev => prev + 1);

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            
            <Route path="/reports" element={<Reports refreshSignal={refreshReport} />} />
          
            <Route path="/sales" element={<Sales onSaleCompleted={handleSaleCompleted} />} />
          </Routes>

          <footer className="footer">
            <p>© wings cafe {new Date().getFullYear()} All rights reserved.</p>
          </footer>
        </main>
      </div>
    </BrowserRouter>
  );
}
