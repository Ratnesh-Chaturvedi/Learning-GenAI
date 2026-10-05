import { getEmbedding } from "../services/embedding";
import fs from "fs";
import path from "path";

const moviesEmbedding = [];

export async function initializeMovies() {
  const filePath = path.join(__dirname, "../movie.json");

  const file = fs.readFileSync(filePath, "utf8");

  const movies = JSON.parse(file);

  for (const movie of movies) {
    const embedding = await getEmbedding(movie.description);

    moviesEmbedding.push({
      title: movie.title,
      description: movie.description,
      embedding,
    });
  }

  console.log(`${moviesEmbedding.length} movies loaded`);
}



function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];

    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const searchMovies = async (query) => {
  try {
    console.log(
        "Movies currently loaded:",
        moviesEmbedding.length
    );
    const queryEmbedding = await getEmbedding(query);

    const matches = moviesEmbedding.map((movie) => {
      const similarity = cosineSimilarity(queryEmbedding, movie.embedding);

      return {
        title: movie.title,
        description: movie.description,
        similarity,
      };
    });

    matches.sort((a, b) => b.similarity - a.similarity);

    const result = matches.slice(0, 3);
    console.log("result:", result);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getSimilarMovies = async (title) => {
  try {
    const selectedMovie = moviesEmbedding.find(
      (movie) => movie.title.toLowerCase() === title.toLowerCase(),
    );

    if (!selectedMovie) {
      throw new Error("Movie not found");
    }

    const matches = moviesEmbedding
      .filter((movie) => movie.title.toLowerCase() !== title.toLowerCase())
      .map((movie) => {
        const similarity = cosineSimilarity(
          selectedMovie.embedding,
          movie.embedding,
        );

        return {
          title: movie.title,
          description: movie.description,
          similarity,
        };
      });

    matches.sort((a, b) => b.similarity - a.similarity);
    const result = matches.slice(0, 3);
    return result;
  } catch (error) {
    console.log(error);
  }
};

// simple search-> scifi movie with action

export const search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const result = await searchMovies(query);
    console.log("result:",result)
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get Similar movies in recommdation ->
export const getSimilarMoviesSearch = async (req, res) => {
  try {
    const { title } = req.params;
    const result = await getSimilarMovies(title);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
