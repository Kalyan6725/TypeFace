import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // URL from storage (e.g., AWS S3, Cloudinary, or local)
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Upload = mongoose.model("Upload", uploadSchema);
export default Upload;
