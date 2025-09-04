import Transaction from "../models/Transaction.js";
import fs from "fs";
import Papa from "papaparse";

// ✅ Create single transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, date } = req.body;

    // Normalize amount before saving
    const normalizedAmount =
      type === "Income" ? Math.abs(amount) : -Math.abs(amount);

    const transaction = new Transaction({
      userId: req.user.id,
      type,
      category,
      amount: normalizedAmount,
      date,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Fetch all user transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { type, category, amount, date } = req.body;

    // normalize amount again
    const normalizedAmount =
      type === "Income" ? Math.abs(amount) : -Math.abs(amount);

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // ensure user owns it
      {
        type,
        category,
        amount: normalizedAmount,
        date,
      },
      { new: true } // return updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Bulk upload transactions from CSV
export const bulkUploadTransactions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf8");

    Papa.parse(fileContent, {
      header: true,
      complete: async (results) => {
        const rows = results.data
          .filter((r) => r.Amount)
          .map((r) => {
            const amt = parseFloat(r.Amount);
            return {
              date: r.Date,
              description: r.Description,
              category: r.Category,
              type: amt >= 0 ? "Income" : "Expense",
              amount: amt >= 0 ? Math.abs(amt) : -Math.abs(amt), // ✅ normalize
              userId: req.user.id,
            };
          });

        await Transaction.insertMany(rows);

        res.status(200).json({
          message: "CSV processed successfully",
          count: rows.length,
        });
      },
      error: (err) => {
        console.error(err);
        res.status(500).json({ message: "CSV parsing failed" });
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
