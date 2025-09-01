// src/components/OCRTest.jsx
import React, { useState } from "react";
import Tesseract from "tesseract.js";

export default function OCRTest() {
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleReadText = async () => {
    if (!file) return alert("Please select an image file first!");

    setLoading(true);
    setOcrText("");

    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m), // shows progress
      });

      setOcrText(text);
    } catch (err) {
      console.error("OCR failed:", err);
      setOcrText("OCR extraction failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", color: "#f1f1f1", background: "#121212", minHeight: "100vh" }}>
      <h2>OCR Test</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleReadText} disabled={loading} style={{ marginLeft: "1rem" }}>
        {loading ? "Processing..." : "Extract Text"}
      </button>

      <pre style={{ background: "#1e1e1e", padding: "1rem", marginTop: "1rem", borderRadius: "8px" }}>
        {ocrText || "OCR result will appear here..."}
      </pre>
    </div>
  );
}
