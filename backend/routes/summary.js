import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ summary: "This is a sample summary." });
});

export default router;
