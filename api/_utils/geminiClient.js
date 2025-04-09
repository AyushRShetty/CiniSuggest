import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Improved logging for API key issues
if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("⚠️ CRITICAL ERROR: GEMINI_API_KEY environment variable not set or contains placeholder value.");
    console.error("Please add your Gemini API key to the .env file. Get one from: https://ai.google.dev/");
}

// Initialize Gemini Client only if the key exists and isn't a placeholder
let genAI;
let model;

// Mock data to use when no valid API key is available
const MOCK_TITLES = {
    "action": ["Die Hard", "The Dark Knight", "Mad Max: Fury Road", "John Wick", "Mission Impossible"],
    "comedy": ["Superbad", "Bridesmaids", "The Hangover", "Dumb and Dumber", "Anchorman"],
    "drama": ["The Shawshank Redemption", "The Godfather", "Schindler's List", "Forrest Gump", "Casablanca"],
    "horror": ["The Shining", "Hereditary", "A Quiet Place", "Get Out", "The Exorcist"],
    "romance": ["The Notebook", "Titanic", "Pride and Prejudice", "Before Sunrise", "La La Land"],
    "sci-fi": ["Blade Runner", "The Matrix", "Inception", "Interstellar", "Alien"],
    "thriller": ["Se7en", "Silence of the Lambs", "Parasite", "Gone Girl", "No Country for Old Men"],
    "default": ["The Shawshank Redemption", "The Dark Knight", "Pulp Fiction", "Forrest Gump", "Inception"]
};

if (GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here") {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // Use the flash model for speed and cost
            // Additional configurations if needed
        });
        console.log("✅ Gemini API client initialized successfully");
    } catch (error) {
        console.error("❌ Failed to initialize Gemini client:", error);
        model = null;
    }
} else {
    console.log("⚠️ Using MOCK data for recommendations since no valid Gemini API key was provided");
    model = null;
}

/**
 * Cleans the titles returned by Gemini.
 * Removes numbering, asterisks, quotes, and trims whitespace.
 */
function cleanTitles(text) {
    if (!text) return [];
    return text
        .split('\n') // Split by newline
        .map(title => title.replace(/^[\d\*\-\.\s"'`]+|[\"'`]+$/g, '').trim()) // Remove leading numbers/symbols/quotes and trailing quotes
        .filter(Boolean); // Remove empty strings
}

/**
 * Gets movie/TV show recommendations for a given genre from Gemini.
 * Falls back to mock data if Gemini is unavailable.
 */
async function getGenreRecommendations(genre, count = 20, mediaType = 'movies and TV shows') {
    // If no valid model, use mock data
    if (!model) {
        console.log(`📌 Using MOCK data for genre "${genre}" (Gemini unavailable)`);
        // Find the closest genre match or use default
        const normalizedGenre = genre.toLowerCase();
        const mockGenre = Object.keys(MOCK_TITLES).find(g => 
            normalizedGenre.includes(g) || g.includes(normalizedGenre)
        ) || "default";
        
        return MOCK_TITLES[mockGenre];
    }
    
    // Use Gemini API with improved prompt
    const prompt = `Recommend ${count} highly regarded ${mediaType} in the '${genre}' genre. 

Focus on works that:
1. Are critically acclaimed or have cultural significance
2. Represent diverse perspectives and storytelling approaches
3. Include both classics and contemporary examples
4. Have distinctive narrative techniques, themes, or visual styles
5. Showcase strong character development and engaging plots

DO prioritize quality and thematic depth over popularity.
DO include some lesser-known gems alongside well-known examples.
DO consider works from different countries and time periods.

List only the exact titles, each on a new line. Do not add any introductory text, numbering, or formatting like asterisks or quotes.`;

    try {
        console.log(`🤖 Gemini Prompt (Genre): ${prompt}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✓ Gemini Response (Raw): ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        const titles = cleanTitles(text);
        console.log(`✓ Gemini Processed Titles (${titles.length}): ${titles.join(', ')}`);
        return titles;
    } catch (error) {
        console.error('❌ Error calling Gemini API for genre recommendations:', error);
        // Log full error for debugging
        console.error('Detailed error:', JSON.stringify(error, null, 2));
        
        // Return mock data instead of throwing an error
        console.log(`📌 Falling back to MOCK data for genre "${genre}" after Gemini API error`);
        const normalizedGenre = genre.toLowerCase();
        const mockGenre = Object.keys(MOCK_TITLES).find(g => 
            normalizedGenre.includes(g) || g.includes(normalizedGenre)
        ) || "default";
        
        return MOCK_TITLES[mockGenre];
    }
}

/**
 * Gets recommendations similar to a given title/synopsis from Gemini.
 * Falls back to mock data if Gemini is unavailable.
 */
async function getSimilarityRecommendations(title, genres, synopsis, count = 20) {
    // If no valid model, use mock data based on genre
    if (!model) {
        console.log(`📌 Using MOCK data for title similarity to "${title}" (Gemini unavailable)`);
        // Find the closest genre match or use default
        const normalizedGenres = Array.isArray(genres) ? 
            genres.map(g => g.toLowerCase()).join(" ") : 
            "";
        
        const mockGenre = Object.keys(MOCK_TITLES).find(g => 
            normalizedGenres.includes(g)
        ) || "default";
        
        return MOCK_TITLES[mockGenre];
    }

    // Use Gemini API with improved prompt focusing on story elements and themes
    const prompt = `Based on the following movie/show:
Title: ${title}
Genres: ${Array.isArray(genres) ? genres.join(', ') : 'N/A'}
Synopsis: ${synopsis || 'No synopsis available.'}

Recommend ${count} similar movies or TV shows that share similar:
1. Narrative structure, story arcs, and character development
2. Themes, messages, and underlying philosophy
3. Atmosphere, tone, and emotional impact
4. Visual style and cinematographic elements
5. Cultural or historical context, if relevant

DO NOT recommend movies that are simply in the same franchise or by the same director.
DO NOT recommend based solely on similar titles or naming conventions.
DO NOT prioritize sequels or prequels.
DO prioritize thematic and story similarity over genre matching.

List only the exact titles of the recommendations, each on a new line. Do not add any introductory text, numbering, or formatting like asterisks or quotes.`;

    try {
        console.log(`🤖 Gemini Prompt (Similarity): ${prompt.substring(0, 150)}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✓ Gemini Response (Raw): ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        const titles = cleanTitles(text);
        console.log(`✓ Gemini Processed Titles (${titles.length}): ${titles.join(', ')}`);
        return titles;
    } catch (error) {
        console.error('❌ Error calling Gemini API for similarity recommendations:', error);
        console.error('Detailed error:', JSON.stringify(error, null, 2));
        
        // Return mock data instead of throwing an error
        console.log(`📌 Falling back to MOCK data for title "${title}" after Gemini API error`);
        const normalizedGenres = Array.isArray(genres) ? 
            genres.map(g => g.toLowerCase()).join(" ") : 
            "";
        
        const mockGenre = Object.keys(MOCK_TITLES).find(g => 
            normalizedGenres.includes(g)
        ) || "default";
        
        return MOCK_TITLES[mockGenre];
    }
}

export {
    getGenreRecommendations,
    getSimilarityRecommendations,
}; 