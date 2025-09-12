import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <h2 className="logo"> Wings Cafe</h2>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
         <li><Link to="/sales">Sales</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
    </nav>
  );
}
