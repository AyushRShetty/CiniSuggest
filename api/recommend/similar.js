import {
    searchMedia,
    getMediaDetails,
    getRecommendationsDetails
} from '../_utils/tmdbClient.js';
import {
    getSimilarityRecommendations
} from '../_utils/geminiClient.js';

// Handler for similarity recommendations
export default async function handler(req, res) {
    const { title } = req.query;

    if (!title || typeof title !== 'string') {
        console.log('❌ Invalid request: Missing or invalid title parameter');
        return res.status(400).json({ 
            message: 'Title query parameter is required and must be a string.' 
        });
    }

    try {
        // 1. Search TMDB for the input title to get its ID and details
        console.log(`🎬 Processing similarity request for title: "${title}"`);
        const initialMedia = await searchMedia(title);

        if (!initialMedia) {
            console.log(`❌ Could not find title "${title}" on TMDB`);
            return res.status(404).json({ 
                message: `Could not find movie/show titled "${title}" on TMDB.` 
            });
        }

        // 2. Get full details (including genres, synopsis) for the found media
        console.log(`ℹ️ Found media: ${initialMedia.title} (${initialMedia.media_type})`);
        const mediaDetails = await getMediaDetails(initialMedia.id, initialMedia.media_type);

        if (!mediaDetails) {
            console.error(`❌ Failed to get details for ${initialMedia.media_type}/${initialMedia.id} after successful search.`);
            return res.status(500).json({ 
                message: 'Error fetching details for the input title.' 
            });
        }

        // 3. Get similar title recommendations from Gemini using the details
        console.log(`🤖 Getting recommendations similar to "${mediaDetails.title}"`);
        const similarTitles = await getSimilarityRecommendations(
            mediaDetails.title,
            mediaDetails.genres,
            mediaDetails.overview,
            20 // Request 20 recommendations instead of the default
        );

        if (!similarTitles || similarTitles.length === 0) {
            console.log(`ℹ️ No similar titles found for "${mediaDetails.title}"`);
            return res.status(200).json([]);
        }

        // 4. Get details for these recommended titles from TMDB
        console.log(`🔍 Fetching details for ${similarTitles.length} similar titles from TMDB...`);
        const detailedRecommendations = await getRecommendationsDetails(similarTitles);

        // Filter out the original input title from the recommendations
        const finalRecommendations = detailedRecommendations.filter(rec => rec.id !== mediaDetails.id);

        console.log(`✅ Returning ${finalRecommendations.length} recommendations similar to: "${mediaDetails.title}"`);
        return res.status(200).json(finalRecommendations);

    } catch (error) {
        console.error(`❌ Error processing similarity recommendation for "${title}":`, error);
        const errorMessage = error.message || 'An unexpected error occurred.';
        return res.status(500).json({ 
            message: errorMessage,
            details: process.env.NODE_ENV !== 'production' ? error.stack : undefined  
        });
    }
} 