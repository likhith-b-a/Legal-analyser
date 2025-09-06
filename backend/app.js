import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import summaryRoutes from "./routes/summary.js";
import askRoutes from "./routes/ask.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/ask", askRoutes);

app.get("/", (req, res) => {
  res.send("Legal AI Backend");
});

export default app;
