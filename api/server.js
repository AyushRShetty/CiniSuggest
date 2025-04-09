// Vercel/Netlify will typically expect a default export handler.
// We wrap the Express logic to fit this pattern.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Check for critical environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Warn about missing API keys
if (!TMDB_API_KEY || TMDB_API_KEY === "your_tmdb_api_key_here") {
    console.error("⚠️ TMDB_API_KEY is missing or using placeholder value!");
    console.error("Please add your TMDB API key to the .env file.");
}

if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("⚠️ GEMINI_API_KEY is missing or using placeholder value!");
    console.error("Please add your Gemini API key to the .env file.");
}

// Create Express app
const app = express();

// Use CORS middleware
app.use(cors());

// Basic request logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Define API routes with dynamic imports to handle ES modules properly
app.get('/api/recommend/genre', async (req, res, next) => {
    try {
        const { default: genreHandler } = await import('./recommend/genre.js');
        await genreHandler(req, res);
    } catch (error) {
        next(error);
    }
});

app.get('/api/recommend/similar', async (req, res, next) => {
    try {
        const { default: similarHandler } = await import('./recommend/similar.js');
        await similarHandler(req, res);
    } catch (error) {
        next(error);
    }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        tmdbApiKey: TMDB_API_KEY ? '✓ Configured' : '✗ Missing',
        geminiApiKey: GEMINI_API_KEY ? '✓ Configured' : '✗ Missing',
    });
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error("❌ SERVER ERROR:", err.stack || err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`
🎬 Media Recommendation API Server
--------------------------------------
🌐 Server running on port ${port}
🔗 API Endpoints:
   - Genre: http://localhost:${port}/api/recommend/genre?genre=...
   - Similar: http://localhost:${port}/api/recommend/similar?title=...
   - Health: http://localhost:${port}/api/health
⚙️ Environment: ${process.env.NODE_ENV || 'development'}
    `);
});

// Export for serverless environments
export default app; 