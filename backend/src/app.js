import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/router.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Legal AI Backend");
});

export default app;
