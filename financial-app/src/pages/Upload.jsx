import React, { useState } from "react";
import API from "../api/axios";
import Tesseract from "tesseract.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Upload.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setOcrText("");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first!");
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    setLoading(true);

    try {
      if (["png", "jpg", "jpeg"].includes(ext)) {
        // === Handle Image with OCR ===
        const { data } = await Tesseract.recognize(file, "eng");
        const text = data.text;
        setOcrText(text);

        const transaction = {
          description: "Scanned Receipt",
          amount: extractAmount(text),
          type: text.toLowerCase().includes("income") ? "income" : "expense",
          date: new Date().toISOString().split("T")[0],
        };

        await API.post("/transactions", transaction, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        toast.success("✅ Transaction saved from OCR!");
      } else if (ext === "csv") {
        // === Handle CSV ===
        const formData = new FormData();
        formData.append("file", file);

        await API.post("/transactions/bulk", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        toast.success("📂 CSV file uploaded successfully!");
      } else {
        toast.warn("⚠️ Unsupported file type. Use PNG, JPG, JPEG, or CSV.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // === Simple helper to extract first number as amount ===
  const extractAmount = (text) => {
    const match = text.match(/(\d+(\.\d{1,2})?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h2 className="upload-title">Upload Receipt / CSV</h2>

        <input type="file" onChange={handleFileChange} className="upload-input" />

        <button onClick={handleUpload} className="upload-button" disabled={loading}>
          {loading ? "Processing..." : "Upload"}
        </button>

        {ocrText && (
          <div className="ocr-output">
            <h3>OCR Extracted Text</h3>
            <pre>{ocrText}</pre>
          </div>
        )}
      </div>

      {/* Toastify Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
