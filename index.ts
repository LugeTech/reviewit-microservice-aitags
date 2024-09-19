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

app.post("/gettags", async (req, res) => {
  try {
    const reviewId = req.body.reviewId;
    let reviewTag = await ReviewTag.findOne({ reviewId: reviewId });
    if (reviewTag) {
      return res.send({ reviewTag: reviewTag.tags });
    }
    const reviewDescription = req.body.description;
    if (!reviewDescription) {
      const reviewFromReviewIt = await getReviewItem(reviewId);
      if (reviewFromReviewIt.data === null) {
        return res.send({ message: "no data found" }).status(404);
      }
      reviewTag = new ReviewTag({
        reviewId: reviewId,
        tags: reviewFromReviewIt.data.tags,
      });

      await reviewTag.save();

      if (reviewDescription || reviewFromReviewIt.data.description) {
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
    }
  } catch (error) {
    const e = error as Error;
    console.log(e.message);
  }
});

app.post("/regen", async (req, res) => {
  try {
    const reviewId = req.body.reviewId;
    const reviewDescription = req.body.description;
    const reviewTag = await ReviewTag.findOne({ reviewId: reviewId });
    if (reviewTag) {
      reviewTag.tags = [];
      await reviewTag.save();
      if (reviewDescription) {
        const prompt = reviewDescription;
        const aiResponse: TagInfo = await aiQuery(prompt);
        reviewTag.tags.push(...aiResponse.tags);
        reviewTag.updatedAt = mongoose.now();
        try {
          await reviewTag.save();
        } catch (error) {
          res.send(error);
        }
      }
      res.send({ reviewTag: reviewTag.tags });
    }
  } catch (error) {
    res.send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
