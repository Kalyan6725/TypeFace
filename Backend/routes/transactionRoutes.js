import express from "express";
import { createTransaction, getTransactions, deleteTransaction, bulkUploadTransactions } from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, createTransaction);
router.post("/bulk",authMiddleware,  upload.single("file"), bulkUploadTransactions);
router.get("/",authMiddleware,  getTransactions);
router.delete("/:id",authMiddleware, deleteTransaction);

export default router;
