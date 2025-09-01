import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";
// import listEndpoints from "express-list-endpoints";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/uploads", uploadRoutes);
// console.log(listEndpoints(app));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));
