import express from 'express';
import { searchByKeyword,getDetailsById } from '../services/api.js';
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

        await db.insert('SearchHistoryKeyword',{
            keyword: keyword.toLowerCase(),
            createdAt: new Date()
        });

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
});

//GET/movies/:id starts below

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await getDetailsById(id);

        await db.insert('SelectionHistory', {
            movieId: id,
            title: movie.title,
            selectedAt: new Date()
        });

        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Could not fetch movie by id'});
    }
});

export default router;



    //     // Saves unique search keywords to the MongoDB SearchHistoryKeyword collection (todo) 

    //     await db.collection('SearchHistoryKeyword').updateOne(
    //         { keyword: keyword.toLowerCase() },
    //         { $setOnInsert: { keyword: keyword.toLowerCase(), createdAt: new Date() } },
    //         { upsert: true }
    //     );


    //     // Returns the JSON response
    //     res.json(formatted);

    // } catch (error) {
    //     res.status(500).json({ error: 'Server error' });
    // }
//})