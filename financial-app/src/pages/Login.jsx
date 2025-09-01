import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 🔹 toggle between login/register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        const res = await API.post("/auth/login", { email, password });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/");
      } else {
        // 🔹 Register
        await API.post("/auth/register", { name, email, password });
        alert("Registration successful! Please login.");
        setMode("login"); // switch back to login after success
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">
          {mode === "login" ? "🔑 Login" : "📝 Register"}
        </h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="login-input"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <button type="submit" className="login-button">
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {/* 🔹 Toggle between Login/Register */}
        <p className="login-register-text">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setMode("register")}
              >
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setMode("login")}
              >
                Login here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
