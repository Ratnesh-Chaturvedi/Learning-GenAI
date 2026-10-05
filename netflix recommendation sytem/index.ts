import express from "express"
import cors from "cors"
import movieRouter from "./routes/movie-routes"
import { initializeMovies } from "./controller/movie-controller"
const app= new express()
app.use(cors())

app.use(express.json())


app.get("/",(req,res)=>{
    res.send("Hello from backend")
})
await initializeMovies();
app.use(express.static(import.meta.dir));

// Routes
app.use("/api/movies",movieRouter);


app.listen(3000,()=>{
    console.log(`app listening at port 3000`)
})
