import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.json({ message: "File received", fileName: req.file.originalname });
});

export default router;
