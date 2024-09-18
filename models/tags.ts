import mongoose from "mongoose";

const reviewTagSchema = new mongoose.Schema({
  reviewId: { type: String, required: true },
  tags: { type: [String] },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const ReviewTag = mongoose.model("reviewTag", reviewTagSchema);

export default ReviewTag;
