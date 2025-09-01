import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Home.css";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/transactions")
      .then((res) => {
        // 🔹 Normalize transactions (same as Reports.jsx)
        const normalized = res.data.map((tx) => {
          const type = tx.type ? tx.type.toLowerCase() : "expense";
          const amount = Number(
            tx.amount.toString().replace(/[^0-9.-]+/g, "")
          );
          const date = new Date(tx.date);
          const isValidDate = !isNaN(date);

          return {
            ...tx,
            type,
            amount,
            date: isValidDate ? date.toISOString() : null,
          };
        });

        const validTx = normalized.filter((t) => t.date !== null);
        setTransactions(validTx);

        // 🔹 Calculate totals
        const income = validTx
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = validTx
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        setTotals({ income, expense });
      })
      .catch((err) =>
        console.error(err.response?.data?.message || "Error fetching transactions")
      );
  }, []);

  const savings = totals.income - totals.expense;

  return (
    <div className="home-page">
      {/* === Hero Section === */}
      <div className="home-hero">
        <h1>Take Control of Your Finances 💼</h1>
        <p>Track. Analyze. Grow.</p>
        <button className="cta-btn" onClick={() => navigate("/transactions")}>
          ➕ Add Transaction
        </button>
      </div>

      {/* === Stats Grid === */}
      <div className="stats-grid">
        <div className="stat-card income">
          <h3>💰 Income</h3>
          <p>₹{totals.income.toLocaleString()}</p>
        </div>
        <div className="stat-card expense">
          <h3>💸 Expenses</h3>
          <p>₹{totals.expense.toLocaleString()}</p>
        </div>
        <div className="stat-card savings">
          <h3>📊 Savings</h3>
          <p>₹{savings.toLocaleString()}</p>
        </div>
      </div>

      {/* === Recent Transactions === */}
      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <ul>
          {transactions.slice(0, 5).map((t) => (
            <li key={t._id}>
              <span>{t.category}</span>
              <span
                className={t.type === "income" ? "income-text" : "expense-text"}
              >
                {t.type === "income" ? "+" : "-"}₹{t.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* === Finance Tip === */}
      <div className="finance-tip">
        💡 “A budget is telling your money where to go instead of wondering where it went.”
      </div>
    </div>
  );
}
