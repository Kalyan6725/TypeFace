import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "./Transactions.css";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "Expense",
    category: "",
    amount: "",
    date: "",
  });

  // Filters
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first

  // ✅ Fetch transactions
  useEffect(() => {
    API.get("/transactions")
      .then((res) => {
        setTransactions(res.data);
        setFilteredTransactions(res.data);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Error fetching transactions")
      );
  }, []);

  // ✅ Apply filters whenever transactions / filters change
  useEffect(() => {
    let result = [...transactions];

    // filter by year
    if (yearFilter !== "all") {
      result = result.filter(
        (t) => new Date(t.date).getFullYear().toString() === yearFilter
      );
    }

    // filter by month
    if (monthFilter !== "all") {
      result = result.filter(
        (t) => (new Date(t.date).getMonth() + 1).toString() === monthFilter
      );
    }

    // sort by date
    result.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortOrder === "asc" ? da - db : db - da;
    });

    setFilteredTransactions(result);
  }, [transactions, yearFilter, monthFilter, sortOrder]);

  // ✅ Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit new / update transaction
  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedData = {
      ...formData,
      amount: Number(formData.amount), // backend decides sign
    };

    if (formData._id) {
      API.put(`/transactions/${formData._id}`, normalizedData)
        .then((res) => {
          setTransactions(
            transactions.map((tx) => (tx._id === formData._id ? res.data : tx))
          );
          toast.success("✅ Transaction updated successfully!");
          resetForm();
        })
        .catch((err) =>
          toast.error(err.response?.data?.message || "Error updating transaction")
        );
    } else {
      API.post("/transactions", normalizedData)
        .then((res) => {
          setTransactions([...transactions, res.data]);
          toast.success("✅ Transaction added successfully!");
          resetForm();
        })
        .catch((err) =>
          toast.error(err.response?.data?.message || "Error adding transaction")
        );
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({ type: "Expense", category: "", amount: "", date: "" });
    setShowForm(false);
  };

  // === Get unique years from transactions ===
  const years = [
    ...new Set(transactions.map((t) => new Date(t.date).getFullYear().toString())),
  ];

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <h2 className="transactions-title">Transactions</h2>

        {/* === Filters === */}
        <div className="filters">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="all">All Months</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* === Add Button or Form === */}
        {!showForm ? (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <FaPlus /> Add Transaction
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
              <button type="submit">{formData._id ? "Update" : "Save"}</button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td className={t.amount >= 0 ? "income-text" : "expense-text"}>
                  {t.amount >= 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                </td>
                <td>
                  <button
                    className="icon-btn edit-btn"
                    title="Edit"
                    onClick={() => {
                      setFormData({
                        type: t.type,
                        category: t.category,
                        amount: t.amount,
                        date: t.date.slice(0, 10),
                        _id: t._id,
                      });
                      setShowForm(true);
                      toast.info("Edit mode enabled");
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Delete"
                    onClick={() => {
                      if (window.confirm("Delete this transaction?")) {
                        API.delete(`/transactions/${t._id}`)
                          .then(() => {
                            setTransactions(
                              transactions.filter((tx) => tx._id !== t._id)
                            );
                            toast.info("Transaction deleted");
                          })
                          .catch((err) =>
                            toast.error(
                              err.response?.data?.message ||
                                "Error deleting transaction"
                            )
                          );
                      }
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}
