import express from "express";
import multer from "multer";
import { handleFileUpload } from "../controllers/uploadController.js";

const router = express.Router();

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// route
router.post("/", upload.single("file"), handleFileUpload);

export default router;
