import { select } from '@inquirer/prompts';
import fs from 'fs';
import {searchByKeyword, getDetailsById} from './services/api.js';
import {showKeywordHistory} from './routes/history.js';

// A function to print the detailed information of a movie
const printMovieDetails = (movie) => {

    /*
     * Printing the details of a movie in a formatted way to the console such as 
     * title, release date, rating, runtime, etc. If movie has a trailer, it adds
     * a link to it on Youtube. If there's a movie cast, it joins in the cast members in
     * a comma-separated string. If not, it'll apply as N/A.
    */
     
    console.log('\n------------- Movie Details -------------');
    console.log(`Title:             ${movie.title}`); 
    console.log(`Release Date:      ${movie.releaseDate}`); 
    console.log(`Rating:            ${movie.rating}`); 
    console.log(`Runtime:           ${movie.runtime} minutes`); 
    console.log(`Genres:            ${movie.genres}`); 
    console.log(`Homepage:          ${movie.homepage}`);
    console.log(`Original Title:    ${movie.originalTitle}`);
    console.log(`Cast:              ${movie.cast ? movie.cast.join(', ') : 'N/A'}`);
    if (movie.trailer) {
        console.log(`Trailer:       https://www.youtube.com/watch?v=${movie.trailer}`);
    }
    console.log(`Overview:          ${movie.overview}`);
    console.log('-----------------------------------------\n');
};

// A function to save the searched keyword to a local JSON file for tracking the movie history
const saveKeywordToHistory = (keyword) => {
    const historyFile = './search_history.json'; // A variable to create the proper json file needed
    
    // Declaring a variable to store history data as an array
    let history = [];

    // An if statement to check if a search history file exists.
    if (fs.existsSync(historyFile)) {
        try {
            const data = fs.readFileSync(historyFile); // Reading the search history file

            // Parsing the date from search history file to a Javascript Object & storing it in history variable
            history = JSON.parse(data);

        } catch (error) { // Catching any errors that could happen while reading/parsing the search history file
            console.error('Invalid! couldn\'t parse/read the search history file:', error);
        }
    }  

    // An if statement to make sure the history variable is initialized as an array. If not, initialize it as an empty array
    if (!Array.isArray(history)) {
        history = [];
    }

    // An if statement to check if keyword is already in search history. If not, add the keyword to history array
    if (!history.includes(keyword)) {
        history.push(keyword);
    }

    // Writing the updated history back to search history file in a formal way w/ 2 spaces for indentation
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
};

// A function to prompt the user(s) to make a choice from a list of movies and return it by the movie id
const movieSelectPrompt = async (movies) => {
    const choices = [
        ...movies.map(movie => ({
            name: `${movie.title} (${movie.releaseDate}) - Rating: ${movie.rating}`,
            value: movie.id
        })),
        { name: 'Exit', value: null }
    ]; // Creating a variable for the list of movies being searched and adding a selection for exiting the list

    const selectedMovieId = await select({
        message: 'Select a movie to view details:',
        choices
    }); // A variable to store selected movie id from the movie list being searched
    
    return selectedMovieId;
};

export const searchFlow = async (keyword) => {
    try {
        // Checks if the keyword is valid
        if (!keyword || typeof keyword !== 'string') {
            console.log('Please enter a valid keyword.');
            return;
        }

        // Saves the keyword to search history
        saveKeywordToHistory(keyword);

        // Calls the API to search for movies using the keyword
        const movies = await searchByKeyword(keyword);

        // If no movies are found it stops
        if (!movies || movies.length === 0) {
            console.log('No movies found for the given keyword.');
            return;
        }

        // Lets the user choose a movie from the list
        const selectedMovieId = await movieSelectPrompt(movies);

        // If user chooses Exit it stop
        if (!selectedMovieId) {
            console.log('Exiting search results.');
            return;
        }

        // Gets full details for the selected movie
        const movieDetails = await getDetailsById(selectedMovieId);

        // Prints the movie details to the console
        printMovieDetails(movieDetails);

    } catch (error) {
        // Catchs and displays any errors
        console.error('Search flow error:', error.message);
    }
};

export const showHistory = async () => {
    try {
        // Gets a keyword from the history file
        const keyword = await showKeywordHistory();

        // If user selects Exit or history is empty it stops
        if (keyword === null) {
            console.log('Exiting history.');
            return;
        }

        // Runs the search again using the selected keyword
        await searchFlow(keyword);

    } catch (error) {
        // Catchs and display any errors
        console.error('History error:', error.message);
    }
};