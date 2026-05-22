import axios from "axios";

const AI_BASE_URL = "http://127.0.0.1:8000";

export const predictCategory = async (description: string) => {
  try {
    const response = await axios.post(
      `${AI_BASE_URL}/predict-category`,
      {
        description,
      }
    );

    return response.data.category;
  } catch (error) {
    console.error("AI Category Prediction Error:", error);

    return "Others";
  }
};