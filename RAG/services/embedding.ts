
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function getEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Valid text is required for embedding");
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
    config: {
      outputDimensionality: 1024,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }

  return embedding;
}
