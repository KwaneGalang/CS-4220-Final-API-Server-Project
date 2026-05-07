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
    // db.find() returns a CURSOR, not an array
    const cursor = await db.find("SearchHistoryKeyword", {});

    // Convert cursor → array manually
    const results = await cursor.toArray();

    // Remove _id manually
    const cleaned = results.map(item => ({
      keyword: item.keyword
    }));

    //DEFAULTS VALUES
    if (results.length === 0) {
      return res.json({
        keywords: [
          { keyword: "batman" },
          { keyword: "spiderman" },
          { keyword: "avatar" }
        ]
      });
    }

    res.json({ keywords: results });

  } catch (err) {
    console.error("HISTORY ERROR:", err.message);
    res.status(500).json({ error: "Failed to retrieve history" });
  }
});

export default router;


