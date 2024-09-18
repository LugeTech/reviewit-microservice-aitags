export const getReviewItem = async (id: string) => {
  const api = process.env.APP_API as string;
  if (api === "" || api === undefined) {
    console.log("No APP Url found");
    return;
  }
  try {
    const reviewData = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });
    const data = await reviewData.json();
    return data;
  } catch (error) {
    const e = error as Error;
    return e.message;
  }
};
