import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import ReviewTag from "./models/tags.ts";
import { aiQuery } from "./llmfunctions/llmQuery.ts";
import { getReviewItem } from "./utils/serverFunctions.ts";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI!);

app.use(express.json());

interface TagInfo {
  tags: string[];
}

app.post("/ai/:reviewId", async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const reviewFromReviewIt = await getReviewItem(reviewId);
    let reviewTag = await ReviewTag.findOne({ reviewId: reviewId });

    if (!reviewTag) {
      reviewTag = new ReviewTag({
        reviewId: reviewId,
        tags: reviewFromReviewIt.data.tags,
      });
      await reviewTag.save();
    }

    if (reviewFromReviewIt.data.description) {
      const prompt = reviewFromReviewIt.data.description;
      const aiResponse: TagInfo = await aiQuery(prompt);
      reviewTag.tags.push(...aiResponse.tags);
      try {
        await reviewTag.save();
      } catch (error) {
        console.log(error);
      }
    }

    res.send({ reviewTag: reviewTag.tags });
  } catch (error) {
    const e = error as Error;
    console.log(e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
