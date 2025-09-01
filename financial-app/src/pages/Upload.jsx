import React, { useState } from "react";
import API from "../api/axios";
import Tesseract from "tesseract.js";
import "./Upload.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setOcrText("");
    // console.log(e.target.files[0].name.split(".").pop().toLowerCase());
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const ext = file.name.split(".").pop().toLowerCase();
    setLoading(true);

    try {
      if (["png", "jpg", "jpeg"].includes(ext)) {
        // === Handle Image with OCR ===
        const { data } = await Tesseract.recognize(file, "eng");
        const text = data.text;
        setOcrText(text);

        // TODO: Parse text into transaction fields (simple demo parsing)
        const transaction = {
          description: "Scanned Receipt",
          amount: extractAmount(text), // helper below
          type: text.toLowerCase().includes("income") ? "income" : "expense",
          date: new Date().toISOString().split("T")[0],
        };

        await API.post("/transactions", transaction);
        alert("Transaction saved from OCR!");
      } else if (ext === "csv") {
        // === Handle CSV ===
        const formData = new FormData();
        formData.append("file",file);
        try{
          await API.post("/transactions/bulk",formData,{
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          alert("CSV file uploaded successfully");
          // console.log("CSV file uploaded successfully");
        }catch(err){
          console.error("Error uploading CSV file:", err);
          alert(err.response?.data?.message || "CSV upload failed")
        }
      } else {
        alert("Unsupported file type. Use PNG, JPG, JPEG, or CSV.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
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
    </div>
  );
}
