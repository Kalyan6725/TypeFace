import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "./Transactions.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false); // ✅ toggle form
  const [formData, setFormData] = useState({
    type: "Expense",
    category: "",
    amount: "",
    date: "",
  });

  // Fetch transactions
  useEffect(() => {
    API.get("/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) =>
        console.error(err.response?.data?.message || "Error fetching transactions")
      );
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new transaction
  const handleSubmit = (e) => {
    e.preventDefault();
    API.post("/transactions", formData)
      .then((res) => {
        setTransactions([...transactions, res.data]);
        setFormData({ type: "Expense", category: "", amount: "", date: "" });
        setShowForm(false); // ✅ hide form after adding
      })
      .catch((err) =>
        console.error(err.response?.data?.message || "Error adding transaction")
      );
  };

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <h2 className="transactions-title">Transactions</h2>

        {/* === Add Button or Form === */}
        {!showForm ? (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            ➕ Add Transaction
          </button>
        ) : (
          <form className="transaction-form" onSubmit={handleSubmit}>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <div className="form-actions">
              <button type="submit">Save</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* === Transactions Table === */}
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td className={t.type === "Income" ? "income-text" : "expense-text"}>
                  {t.type === "Income" ? "+" : "-"}₹{t.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
