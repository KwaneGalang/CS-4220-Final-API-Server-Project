/* CS 4220 Final - Building an Node.js Server application using Node.js, Axios, MongoDB, & Express w/ the chosen API: 
 *
 * Written by: Kwane Galang, Alan Mai, Daniel Gomez, Nikole Cabrera, Marco Rodriguez
 * Website used for basic functions: https://javascript.info
 * Website used for Node.js functions: https://nodejs.dev
 * Website used for axios: https://www.npmjs.com/package/axios
 * 
 * Date: Apri; 27, 2026
 * Last Updated: May 10, 2026
 * 
 * An API Token is required to run the application, which is listed under the .env file.
 * 
 * If the .env file is missing and/or the user would like to use a token of their own, the steps below can be followed:
 * 
 * 1. Create a .env file in the main project folder
 * 
 * 2. Under the .env file, include: TMDB_BEARER_TOKEN=<your_token>
 * 
 * 3. The API token can be generated and used by creating an account on the TMDB website, copying the 'API Read Access Token'
 *    and replacing the <your_token> with the actual token
 * 
 * Below are the endpoints available in this application:
 * Utilized a REST Client extension to send requests to server & test endpoints
 * 
 * GET http://localhost:4545/movies?keyword=<keyword>
 * Searches for movies based on the matching keyword by the TMDB API
 * 
 * GET http://localhost:4545/movies/<movie_id>
 * Returns detailed info about a particular movie based on movie id, the identifier returned from search endpoint
 *
 * GET http://localhost:4545/history?keyword=<keyword>
 * Getting a list of all search keywords that's been searched for in the past & sorted by most recent search first being stored in MongoDB SearchHistoryKeyword collection
 * 
 * GET http://localhost:4545/
 * Getting a welcome message when first accessing the
 * 
*/

// Import the necessary modules and routers to connect to this server file
import express from 'express';
import db from './services/db.js';
import moviesRouter from './routes/movies.js';
import historyRouter from './routes/history.js';

// Declaring variables for instances of the express application of the API project and a port number to run the server.
const app = express(); 
const PORT = process.env.PORT || 4545; // Initializing a port number for server listening

// The Middleware to parse JSON bodies from the get requests, allowing server to know and process data sent in request bodies.
app.use(express.json());

await db.connect(); // Connecting to the database before starting the server, ensuring that the server only starts if the database connection is successful.

// A Get request to the root server endpoint, returning a welcome message to the user when first accessing the API.
app.get('/', (req, res) => {
    res.send('Welcome to the Movie Search API Application!');
});

// Using the proper routes for the movies and history endpoints.
app.use('/movies', moviesRouter);
app.use('/history', historyRouter);

/*
 * Starting and running the server w/ a specified port #, and the console will print out that the server is operational.
*/ 
app.listen(PORT, async () => {

    try {
        await db.connect(); // connecting database before starting the server
        console.log(`Server is running on port ${PORT}`);
    } catch (error) { // Catching errors if database connection failed which would make the process exit and the server not start.
        console.error('Failed to connect to the database', error); 
        process.exit(1);
    }
});

