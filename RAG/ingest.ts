
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PDFParse } from "pdf-parse";
import type { PineconeRecord } from "@pinecone-database/pinecone";

import { getEmbedding } from "./services/embedding.ts";
import { index } from "./services/pinecone.ts";

// Configuration
const KNOWLEDGE_DIR = path.resolve(process.cwd(), "knowledge");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_DIMENSIONS = 1024;
const BATCH_SIZE = 20;

// Step 1: Split text into overlapping chunks
function splitIntoChunks(text: string): string[] {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];

  const step = CHUNK_SIZE - CHUNK_OVERLAP;

  for (let i = 0; i < cleanText.length; i += step) {
    const chunk = cleanText.slice(i, i + CHUNK_SIZE).trim();

    if (chunk) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

// Step 2: Generate unique and consistent vector IDs
function generateId(
  source: string,
  chunkNumber: number,
  text: string
): string {
  return createHash("sha256")
    .update(`${source}:${chunkNumber}:${text}`)
    .digest("hex");
}

// Step 3: Extract text from PDF
async function extractPDF(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);

  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

// Step 4: Upload vectors to Pinecone
async function uploadBatch(records: PineconeRecord[]) {
  if (records.length === 0) return;

  await index.upsert({ records });

  console.log(`Uploaded ${records.length} vectors to Pinecone`);
}

// Step 5: Main ingestion function
export async function ingestKnowledgeBase(): Promise<number> {
  const files = (await readdir(KNOWLEDGE_DIR))
    .filter((file) => file.toLowerCase().endsWith(".pdf"))
    .sort();

  if (files.length === 0) {
    console.log("No PDF files found in knowledge folder.");
    return 0;
  }

  let totalChunks = 0;

  for (const file of files) {
    console.log(`\nProcessing: ${file}`);

    // Read PDF
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const text = await extractPDF(filePath);

    if (!text.trim()) {
      console.log(`No extractable text found in ${file}`);
      continue;
    }

    // Split text into chunks
    const chunks = splitIntoChunks(text);

    console.log(`Generated ${chunks.length} chunks`);

    let records: PineconeRecord[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding using existing service
      const embedding = await getEmbedding(chunk);

      if (embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
        );
      }

      // Prepare Pinecone record
      records.push({
        id: generateId(file, i, chunk),
        values: embedding,
        metadata: {
          source: file,
          chunk: i,
          text: chunk,
        },
      });

      // Upload in batches
      if (records.length >= BATCH_SIZE) {
        await uploadBatch(records);
        records = [];
      }
    }

    // Upload remaining records
    if (records.length > 0) {
      await uploadBatch(records);
    }

    totalChunks += chunks.length;

    console.log(`Completed: ${file}`);
  }

  return totalChunks;
}

// Step 6: Execute ingestion directly with Bun
if (import.meta.main) {
  ingestKnowledgeBase()
    .then((count) => {
      console.log("\nIngestion completed successfully!");
      console.log(`Total chunks stored: ${count}`);
    })
    .catch((error) => {
      console.error("Ingestion failed:", error);
      process.exitCode = 1;
    });
}
