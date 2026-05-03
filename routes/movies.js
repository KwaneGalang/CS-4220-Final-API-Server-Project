import express from 'express';
import { searchByKeyword } from '../services/api.js';
import db from '../services/db.js';

const router = express.Router()

// GET /movies?keyword=<keyword>
router.get('/', async (req, res) => {
    try {

        // "Uses a query parameter to accept the keyword"
        const { keyword } = req.query;

        // Validation
        if (!keyword) {
            return res.status(400).json({
                error: 'Keyword query parameter is required'
            });
        }

        // "Interacts with api.js to perform the search by keyword"
        const movies = await searchByKeyword(keyword);

        // Creates the response (display & identifier)
        const formatted = movies.map((movie) => ({
            display: `${movie.title} (${movie.releaseDate})`,
            identifier: movie.id
        }));


        // Saves unique search keywords to the MongoDB SearchHistoryKeyword collection (todo) 

        await db.collection('SearchHistoryKeyword').updateOne(
    { keyword: keyword.toLowerCase() },
    { $setOnInsert: { keyword: keyword.toLowerCase(), createdAt: new Date() } },
    { upsert: true }
);


        // Returns the JSON response
        res.json(formatted);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})