import {
    getRecommendationsDetails
} from '../_utils/tmdbClient.js';
import {
    getGenreRecommendations
} from '../_utils/geminiClient.js';

// This function will be the handler for the serverless function
export default async function handler(req, res) {
    const { genre } = req.query;

    if (!genre || typeof genre !== 'string') {
        console.log('❌ Invalid request: Missing or invalid genre parameter');
        return res.status(400).json({ 
            message: 'Genre query parameter is required and must be a string.' 
        });
    }

    try {
        // 1. Get title recommendations from Gemini
        console.log(`🎬 Processing genre recommendation request for: "${genre}"`);
        const recommendedTitles = await getGenreRecommendations(genre, 20);

        if (!recommendedTitles || recommendedTitles.length === 0) {
            console.log(`ℹ️ No recommendations found for genre: "${genre}"`);
            return res.status(200).json([]);
        }

        // 2. Get details (including posters) for these titles from TMDB
        console.log(`🔍 Fetching details for ${recommendedTitles.length} titles from TMDB...`);
        const detailedRecommendations = await getRecommendationsDetails(recommendedTitles);

        console.log(`✅ Returning ${detailedRecommendations.length} recommendations for genre: "${genre}"`);
        return res.status(200).json(detailedRecommendations);

    } catch (error) {
        console.error(`❌ Error processing genre recommendation for "${genre}":`, error);
        // Send back appropriate error message
        const errorMessage = error.message || 'An unexpected error occurred.';
        return res.status(500).json({ 
            message: errorMessage,
            // Include extra details in dev but not in production
            details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
} 