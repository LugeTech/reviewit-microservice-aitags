import ReviewTag from "../models/tags";

export const createReviewTag = async (
  description: string,
  reviewId: string,
) => {
  const reviewTag = await ReviewTag.create({
    description: description,
    reviewId: reviewId,
  });
  return reviewTag;
};
