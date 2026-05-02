import express from "express";
import db from "../services/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { type } = req.query;

  // Validate query parameter
  if (!type) {
    return res.status(400).json({ error: "Query parameter 'type' is required" });
  }

  if (type !== "keywords") {
    return res.status(400).json({ error: "Invalid type. Only 'keywords' is allowed." });
  }

  try {
    const collection = db.getCollection("SearchHistoryKeyword");

    const results = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();

    res.json({ keywords: results });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve history" });
  }
});

export default router;

