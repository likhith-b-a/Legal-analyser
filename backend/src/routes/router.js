import express from "express";
import { upload } from "../middlewares/upload.js";
import { getSummary } from "../controllers/summary.js";

const router = express.Router();

router.route("/summary").post(upload.single("file"), getSummary);

export default router;
