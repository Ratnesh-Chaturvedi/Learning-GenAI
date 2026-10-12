import express from "express";
import cors from "cors";

import { answerQuestion } from "./services/rag.ts";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "RAG server is running",
  });
});

// RAG question-answering API
app.get("/api/chat", async (req, res) => {
  try {
    const question = req.body?.question;

    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.length > 2000
    ) {
      return res.status(400).json({
        error: "Question must be 1-2000 characters.",
      });
    }

    const result = await answerQuestion(question.trim());

    return res.status(200).json(result);
  } catch (error) {
    console.error("RAG error:", error);

    return res.status(500).json({
      error: "Failed to process the question.",
    });
  }
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`RAG API running on http://localhost:${PORT}`);
});
