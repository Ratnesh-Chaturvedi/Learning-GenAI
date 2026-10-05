import { search, getSimilarMoviesSearch } from "../controller/movie-controller";

import express from "express";
const movieRouter = express.Router();

movieRouter.get("/search", search);
movieRouter.get("/:title/similar", getSimilarMoviesSearch);

export default movieRouter;
