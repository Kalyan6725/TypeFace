import Transaction from "../models/Transaction.js";
import fs from "fs";
import Papa from "papaparse";

export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, date } = req.body;
    const transaction = new Transaction({
      userId: req.user.id,
      type,
      category,
      amount,
      date
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bulkUploadTransactions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    console.log(JSON.stringify(req.body.transactions));
     const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf8");
    Papa.parse(fileContent, {
      header: true,
      complete: async (results) => {
        const rows = results.data
          .filter((r) => r.Amount)
          .map((r) => ({  
          date: r.Date,
          description: r.Description,
          amount: parseFloat(r.Amount),
          category: r.Category,
          type: parseFloat(r.Amount) >= 0 ? "income" : "expense", // derive from amount
          userId: req.user._id, // make sure authMiddleware attaches user
        }));

        console.log("Raw data:", results.data);  
        console.log("Parsed transactions:", rows);

        // Example DB insert:
        await Transaction.insertMany(rows.map(r => ({ ...r, userId: req.user.id })));

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
  }catch (err) {
    res.status(500).json({ message: err.message });
  }
};
