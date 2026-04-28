import 'dotenv/config';

// Base URL for TMDB API requests. All endpoints are appended to this.

const BASE_URL = 'https://api.themoviedb.org/3';

// Read TMDB bearer token from environment. This file expects a .env with TMDB_BEARER_TOKEN.

const TOKEN = process.env.TMDB_BEARER_TOKEN;

// Fail fast if token is missing so callers get a clear error during startup.

if(!TOKEN){
    throw new Error('Missing TMDB_BEARER_TOKEN in .env');
}

/*
 * Helper: tmdbFetch
 * - path: API path (e.g. '/search/movie' or `/movie/${id}`)
 * - params: optional query parameters object; undefined/null/empty-string values are skipped
 *
 * Builds a full URL, attaches query params, sets Authorization header with the bearer token,
 * performs a GET request using the global fetch, and returns the parsed JSON body.
 * Throws a descriptive error on non-2xx responses.
 */
async function tmdbFetch(path, params = {}){
    const url = new URL(`${BASE_URL}${path}`);

    // Attach only defined/meaningful params to the query string

    for(const [key, value] of Object.entries(params)){
        if (value !== undefined && value !== null && value !== ''){
            url.searchParams.set(key, value);
        }
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            // ask for JSON and include bearer token for authentication
            accept: 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    // If TMDB returned an error status, include the response text in the thrown error.

    if(!response.ok){
        const errorText = await response.text();
        throw new Error(`TMDB API Error ${response.status}: ${errorText}`);
    }

    // Return the parsed JSON body to the caller.

    return response.json();
}

/*
 * Public API: searchByKeyword
 * - Validates the keyword parameter (must be a non-empty string)
 * - Calls TMDB search/movie endpoint and returns a simplified array of movie objects
 * - Normalizes missing fields with fallbacks so callers can rely on consistent shapes
 */

export async function searchByKeyword(keyword){
    if(!keyword || typeof keyword !== 'string'){

        // Keep the original (colorful) error message but make the intent clear: invalid input

        throw new Error('Type up a valid keyword dammit!');
    }

    // Query TMDB for movies matching the keyword. We set some sane defaults.

    const data = await tmdbFetch('/search/movie', {
        query: keyword,
        language: 'en-US',
        page: 1,
        include_adult: false,
    });

    // If the API response doesn't include results, return an empty list instead of throwing.

    if(!data.results || !Array.isArray(data.results)){
        return [];
    }

    // Map TMDB's result objects into a smaller, predictable shape for the consumer.

    return data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date || 'unknown',
        rating: movie.vote_average ?? 'N/A',
        overview: movie.overview || 'No overview availiable',
    }));
}

/*
 * Public API: getDetailsById
 * - Validates id
 * - Fetches the movie details and requests additional `credits` and `videos` in the same call
 * - Returns a normalized object with selected fields (runtime formatted, top cast, trailer key, etc.)
 */

export async function getDetailsById(id){
    if(!id){
        throw new Error('A valid movie ID is needed!');
    }

    // Use append_to_response to fetch credits and videos in the same request for efficiency.

    const movie = await tmdbFetch(`/movie/${id}`, {
        language: 'en-US',
        append_to_response: 'credits,videos',
    });

    // Normalize and return only the fields the rest of the app needs.
    return {
        id: movie.id,
        title: movie.title,

        // Note: originalTitle property here appears to be set from release_date in the original code —
        // keep the same behavior but label is slightly misleading.

        originalTitle: movie.release_date || 'Unknown',
        releaseDate: movie.release_date || 'unknown',
        runtime: movie.runtime ? `${movie.runtime} minutes` : 'unknown',
        rating: movie.vote_average ?? 'N/A',
        genres: movie.genres ? movie.genres.map((g) => g.name).join(', ') : 'unknown',
        overview: movie.overview || 'no overview',
        homepage: movie.homepage || 'N/A',

        // Return the first 5 cast member names if available, otherwise an empty array.

        cast: movie.credits?.cast
            ? movie.credits.cast.slice(0, 5).map((actor) => actor.name)
            : [],

        // Find a YouTube trailer in the videos array and return its key (or null if none found).

        trailer: movie.videos?.results
            ? movie.videos.results.find(
                (video) => video.type === 'trailer' && video.site === 'YouTube'
            )?.key || null
            : null,
    };
}