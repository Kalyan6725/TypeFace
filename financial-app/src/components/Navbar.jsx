import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  // check login from localStorage (you could also use Context/Redux later)
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear JWT
    navigate("/login"); // redirect to login page
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">💰 Finance Assistant</h1>
      <div className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/upload">Upload</NavLink>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}
