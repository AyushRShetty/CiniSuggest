import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/';

// Basic in-memory cache to reduce redundant TMDB calls
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheKey(prefix, key) {
    return `${prefix}_${key.toLowerCase().replace(/\s+/g, '_')}`;
}

function getFromCache(key) {
    const entry = cache.get(key);
    if (entry && Date.now() < entry.expiry) {
        return entry.value;
    }
    cache.delete(key); // Remove expired entry
    return null;
}

function setInCache(key, value) {
    const expiry = Date.now() + CACHE_TTL;
    cache.set(key, { value, expiry });
}

/**
 * Searches TMDB for a movie or TV show by title.
 * Returns the first result if found, otherwise null.
 */
async function searchMedia(query) {
    const cacheKey = getCacheKey('search', query);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
    try {
        console.log(`TMDB Search URL: ${url.replace(TMDB_API_KEY, 'REDACTED')}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDB multi-search failed (${response.status}): ${response.statusText}`);
        const data = await response.json();

        // Find the first movie or tv result
        const result = data.results?.find(r => r.media_type === 'movie' || r.media_type === 'tv');

        if (result) {
            const simplifiedResult = {
                id: result.id,
                title: result.title || result.name, // Handle movie/tv title difference
                media_type: result.media_type,
                poster_path: result.poster_path,
                overview: result.overview,
                genre_ids: result.genre_ids,
                vote_average: result.vote_average,
                release_date: result.release_date || result.first_air_date,
            };
            setInCache(cacheKey, simplifiedResult);
            return simplifiedResult;
        } else {
             setInCache(cacheKey, null); // Cache miss
             return null;
        }
    } catch (error) {
        console.error('Error searching TMDB:', error.message);
        return null;
    }
}

/**
 * Gets detailed information for a specific movie or TV show ID.
 */
async function getMediaDetails(id, media_type) {
     if (!id || !media_type || (media_type !== 'movie' && media_type !== 'tv')) {
         console.error('Invalid arguments for getMediaDetails:', { id, media_type });
         return null;
     }
    const cacheKey = getCacheKey(`details_${media_type}`, String(id));
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${TMDB_BASE_URL}/${media_type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
    try {
        console.log(`TMDB Details URL: ${url.replace(TMDB_API_KEY, 'REDACTED')}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDB details fetch failed (${response.status}): ${response.statusText}`);
        const data = await response.json();

        const details = {
            id: data.id,
            title: data.title || data.name,
            overview: data.overview,
            genres: data.genres?.map(g => g.name) || [], // Ensure genres is an array
            poster_path: data.poster_path,
            vote_average: data.vote_average,
            release_date: data.release_date || data.first_air_date,
            media_type: media_type
        };
        setInCache(cacheKey, details);
        return details;

    } catch (error) {
        console.error(`Error getting TMDB details for ${media_type}/${id}:`, error.message);
        return null;
    }
}

/**
 * Takes a list of titles (potentially from Gemini), searches TMDB for each,
 * and returns details (incl. poster URL) for found items.
 */
async function getRecommendationsDetails(titles) {
    if (!Array.isArray(titles) || titles.length === 0) {
        return [];
    }

    const results = [];
    // Use Promise.allSettled to handle potential errors for individual titles
    const searchPromises = titles.map(title => searchMedia(title));
    const searchResults = await Promise.allSettled(searchPromises);

    for (const result of searchResults) {
        if (result.status === 'fulfilled' && result.value) {
            const media = result.value;
            // Fetch full details to potentially get more genre info if needed,
            // but searchMedia now returns most needed fields.
            // const detailedMedia = await getMediaDetails(media.id, media.media_type);
            // const itemToAdd = detailedMedia || media; // Prefer detailed if available

            results.push({
                id: media.id,
                title: media.title,
                posterUrl: getPosterUrl(media.poster_path),
                year: media.release_date,
                rating: media.vote_average,
                overview: media.overview, // Include overview
                media_type: media.media_type
            });
        } else if (result.status === 'rejected') {
            console.warn(`Failed to search TMDB for title derived from recommendation: ${result.reason}`);
        }
    }

    // Simple deduplication based on id
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

    return uniqueResults;
}

/**
 * Constructs the full URL for a TMDB poster image.
 */
function getPosterUrl(posterPath, size = 'w500') {
    if (!posterPath) {
        return null; // Or return a placeholder image URL string
    }
    return `${POSTER_BASE_URL}${size}${posterPath}`;
}

// Clear cache periodically (optional, simple cleanup)
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (now >= entry.expiry) {
            cache.delete(key);
        }
    }
    console.log('TMDB Client Cache Cleared (Expired Entries)');
}, CACHE_TTL * 2); // Check every 20 mins

export {
    searchMedia,
    getMediaDetails,
    getRecommendationsDetails,
    getPosterUrl,
}; 