import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const question = req.body.question;
  res.json({ answer: "This is a sample answer.", question });
});

export default router;
