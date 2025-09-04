import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaPiggyBank, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false); // close dropdown
    navigate("/login");
  };

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <h1
        className="navbar-title"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
      >
        <FaPiggyBank style={{ fontSize: "1.5em" }} /> Finance Assistant
      </h1>

      <div className="navbar-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/upload">Upload</NavLink>

        {isLoggedIn ? (
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle style={{ marginRight: "6px" }} />
              {user?.name || "User"}
            </button>
            {dropdownOpen && (
              <div className="dropdown">
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}
