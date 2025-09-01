import React, { useEffect, useState } from "react";
import API from "../api/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import "./Reports.css";

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, year, all
  const [typeFilter, setTypeFilter] = useState("both"); // income, expense, both

  useEffect(() => {
    API.get("/transactions")
      .then((res) => {
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

        setTransactions(normalized.filter((t) => t.date !== null));
      })
      .catch((err) =>
        console.error(
          err.response?.data?.message || "Error fetching transactions"
        )
      );
  }, []);

  // === Utility: group by period ===
  const groupByPeriod = (data) => {
    const grouped = {};
    data.forEach((tx) => {
      const date = new Date(tx.date);
      if (isNaN(date)) return;

      let key;
      if (timeFilter === "week") {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
      } else if (timeFilter === "month") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else if (timeFilter === "year") {
        key = `${date.getFullYear()}`;
      } else {
        key = "All Time";
      }

      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
      if (tx.type === "income") grouped[key].income += tx.amount;
      if (tx.type === "expense") grouped[key].expense += tx.amount;
    });

    return Object.entries(grouped).map(([period, values]) => ({
      period,
      ...values,
    }));
  };

  // === Utility: pie by category (expenses only, positive values, group small ones) ===
  let pieData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, tx) => {
      const amount = Math.abs(tx.amount);
      const found = acc.find((item) => item.category === tx.category);
      if (found) found.amount += amount;
      else acc.push({ category: tx.category, amount });
      return acc;
    }, []);

  // Group small slices into "Other"
  const total = pieData.reduce((sum, item) => sum + item.amount, 0);
  const refinedPieData = [];
  let others = 0;

  pieData.forEach((item) => {
    if (item.amount / total < 0.03) {
      others += item.amount;
    } else {
      refinedPieData.push(item);
    }
  });
  if (others > 0) refinedPieData.push({ category: "Other", amount: others });

  // === Utility: stacked bar by category ===
  const categoryTrend = (() => {
    const grouped = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((tx) => {
        const date = new Date(tx.date);
        if (isNaN(date)) return;

        let key =
          timeFilter === "month"
            ? `${date.getFullYear()}-${date.getMonth() + 1}`
            : timeFilter === "year"
            ? `${date.getFullYear()}`
            : "All Time";

        if (!grouped[key]) grouped[key] = {};
        grouped[key][tx.category] =
          (grouped[key][tx.category] || 0) + Math.abs(tx.amount);
      });

    return Object.entries(grouped).map(([period, values]) => ({
      period,
      ...values,
    }));
  })();

  // === Filter type ===
  const filteredTransactions =
    typeFilter === "both"
      ? transactions
      : transactions.filter((t) => t.type === typeFilter);

  const barData = groupByPeriod(filteredTransactions);

  const COLORS = [
    "#60a5fa",
    "#fbbf24",
    "#34d399",
    "#f87171",
    "#a78bfa",
    "#f472b6",
    "#22d3ee",
  ];

  return (
    <div className="reports-page">
      <div className="reports-container">
        <h2 className="reports-title">Reports & Analytics</h2>

        {/* === Filters === */}
        <div className="filters">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="both">Income + Expense</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        {/* === Charts Section === */}
        <div className="reports-charts">
          {/* Bar Chart */}
          <div className="chart-card">
            <h3>Income vs Expense</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#4ade80" />
                <Bar dataKey="expense" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="chart-card">
            <h3>Cashflow Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={barData}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4ade80"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f87171"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-card">
            <h3>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={refinedPieData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, amount }) =>
                    `${category}: ₹${amount.toFixed(0)}`
                  }
                >
                  {refinedPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelFormatter={(label) => `Category: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar Chart */}
          <div className="chart-card">
            <h3>Category Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryTrend}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(categoryTrend[0] || {})
                  .filter((k) => k !== "period")
                  .map((cat, index) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="a"
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
