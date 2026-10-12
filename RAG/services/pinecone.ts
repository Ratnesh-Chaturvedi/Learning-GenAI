import { Pinecone } from '@pinecone-database/pinecone';
import "dotenv/config"
export const pc = new Pinecone({
    apiKey: `${process.env.PINECONE_API_KEY}`,
});


export const index = pc.index({
  name: process.env.PINECONE_INDEX
});