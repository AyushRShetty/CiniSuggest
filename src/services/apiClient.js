// This service handles calls to our backend API

const API_BASE_URL = import.meta.env.API_BASE_URL || '/api';
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Log environment variables availability (for debugging)
console.log("Environment variables status:", {
  NODE_ENV: import.meta.env.MODE,
  TMDB_API_KEY: import.meta.env.TMDB_API_KEY ? "Set" : "Not set",
  API_BASE_URL: import.meta.env.API_BASE_URL || "Not set",
});

// API Endpoints and keys
const TMDB_API_KEY = import.meta.env.TMDB_API_KEY || 'b8e16ff25f44004fe2ab5dedc9e0453a'; // Fallback to demo key
if (!import.meta.env.TMDB_API_KEY) {
  console.warn("TMDB_API_KEY not found in environment variables, using fallback key");
}

const TMDB_IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchGenreRecommendations(genre) {
    console.log(`Fetching genre recommendations for: ${genre}`);
    try {
        const response = await fetch(`${API_BASE_URL}/recommend/genre?genre=${encodeURIComponent(genre)}`);
        console.log(`Genre API response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch genre recommendations' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length || 0} genre recommendations`);
        return data;
    } catch (error) {
        console.error(`Error in fetchGenreRecommendations:`, error);
        throw error;
    }
}

async function fetchSimilarityRecommendations(title) {
    console.log(`Fetching similarity recommendations for: ${title}`);
    try {
        // First try our API
        const apiResponse = await fetch(`${API_BASE_URL}/recommend/similar?title=${encodeURIComponent(title)}`);
        console.log(`Similarity API response status: ${apiResponse.status}`);
        
        // If our API works, return its results
        if (apiResponse.ok) {
            const data = await apiResponse.json();
            console.log(`Received ${data.length || 0} similarity recommendations from API`);
            return data;
        }
        
        // If API fails, fall back to TMDB search + discover
        console.log(`API call failed, falling back to TMDB content-based recommendations`);
        
        // First, search for the movie/show by title
        const searchUrl = `${TMDB_API_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
        const searchResponse = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
            throw new Error(`Failed to search TMDB: ${searchResponse.status}`);
        }
        
        const searchData = await searchResponse.json();
        
        if (!searchData.results || searchData.results.length === 0) {
            console.log(`No search results found for "${title}"`);
            return [];
        }
        
        // Get the first relevant result
        const firstResult = searchData.results.find(item => 
            (item.media_type === 'movie' || item.media_type === 'tv') && 
            (item.title || item.name)
        );
        
        if (!firstResult) {
            console.log(`No valid media found for "${title}"`);
            return [];
        }
        
        // Get genres for this media
        const mediaType = firstResult.media_type;
        const mediaId = firstResult.id;
        
        // Get recommendations based on this media
        const recommendUrl = `${TMDB_API_URL}/${mediaType}/${mediaId}/recommendations?api_key=${TMDB_API_KEY}`;
        const recommendResponse = await fetch(recommendUrl);
        
        if (!recommendResponse.ok) {
            console.log(`Recommendations call failed, falling back to discover`);
            
            // If recommendations fail, fall back to genre-based discovery
            // Get genres for this media
            const detailsUrl = `${TMDB_API_URL}/${mediaType}/${mediaId}?api_key=${TMDB_API_KEY}`;
            const detailsResponse = await fetch(detailsUrl);
            
            if (!detailsResponse.ok) {
                throw new Error(`Failed to get media details: ${detailsResponse.status}`);
            }
            
            const details = await detailsResponse.json();
            const genres = details.genres?.map(g => g.id).join(',') || '';
            
            if (!genres) {
                return searchData.results
                    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                    .slice(0, 20)
                    .map(formatTMDBResult);
            }
            
            // Use genres to discover similar content
            const discoverUrl = `${TMDB_API_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genres}&sort_by=popularity.desc`;
            const discoverResponse = await fetch(discoverUrl);
            
            if (!discoverResponse.ok) {
                throw new Error(`Failed to discover by genre: ${discoverResponse.status}`);
            }
            
            const discoverData = await discoverResponse.json();
            return (discoverData.results || []).slice(0, 20).map(item => formatTMDBResult(item, mediaType));
        }
        
        // Process recommendations
        const recommendData = await recommendResponse.json();
        return (recommendData.results || []).slice(0, 20).map(item => formatTMDBResult(item, mediaType));
        
    } catch (error) {
        console.error(`Error in fetchSimilarityRecommendations:`, error);
        throw error;
    }
}

// Helper function to format TMDB results consistently
function formatTMDBResult(item, defaultMediaType = 'movie') {
    const isMovie = item.media_type === 'movie' || (!item.media_type && item.title) || defaultMediaType === 'movie';
    return {
        id: item.id,
        title: isMovie ? item.title : item.name,
        posterUrl: item.poster_path ? `${TMDB_IMG_BASE_URL}${item.poster_path}` : null,
        backdropUrl: item.backdrop_path ? `${TMDB_IMG_BASE_URL}${item.backdrop_path}` : null,
        year: new Date(isMovie ? item.release_date : item.first_air_date || '').getFullYear() || '',
        rating: item.vote_average,
        overview: item.overview,
        media_type: item.media_type || (isMovie ? 'movie' : 'tv')
    };
}

async function fetchMediaTrailer(media) {
    console.log(`Fetching trailer for media:`, media.id, media.title, `type:${media.media_type || 'movie'}`);
    try {
        const mediaType = media.media_type || 'movie'; // Default to movie if not specified
        const url = `${TMDB_API_URL}/${mediaType}/${media.id}/videos?api_key=${TMDB_API_KEY}`;
        
        console.log(`Making TMDB videos API call to: ${TMDB_API_URL}/${mediaType}/${media.id}/videos`);
        const response = await fetch(url);
        console.log(`TMDB trailer API response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch trailer: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            console.log(`No trailers found for ${media.title}`);
            return { key: null };
        }
        
        // Find the official trailer if possible
        let trailer = data.results.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' && 
            video.official === true
        );
        
        // If no official trailer, look for any trailer
        if (!trailer) {
            trailer = data.results.find(video => 
                video.type === 'Trailer' && 
                video.site === 'YouTube'
            );
        }
        
        // If still no trailer, use any video (teaser, featurette, etc.)
        if (!trailer && data.results.length > 0) {
            trailer = data.results.find(video => video.site === 'YouTube');
        }
        
        if (trailer) {
            console.log(`Found trailer with key: ${trailer.key}`);
            return { key: trailer.key };
        } else {
            console.log(`No YouTube videos found for ${media.title}`);
            return { key: null };
        }
    } catch (error) {
        console.error('Error fetching trailer:', error);
        return { key: null };
    }
}

async function fetchSimilarMedia(media) {
    console.log(`Fetching similar media for: ${media.id}, ${media.title}, type:${media.media_type || 'movie'}`);
    try {
        const mediaType = media.media_type || 'movie'; // Default to movie if not specified
        
        // Get both similar media and recommendations for better content-based similarity
        const [similarResponse, recommendationsResponse] = await Promise.all([
            fetch(`${TMDB_API_URL}/${mediaType}/${media.id}/similar?api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_API_URL}/${mediaType}/${media.id}/recommendations?api_key=${TMDB_API_KEY}`)
        ]);
        
        console.log(`TMDB similar API status: ${similarResponse.status}, recommendations API status: ${recommendationsResponse.status}`);
        
        if (!similarResponse.ok && !recommendationsResponse.ok) {
            throw new Error(`Failed to fetch similar media: ${similarResponse.status}, ${recommendationsResponse.status}`);
        }
        
        // Process the results from both endpoints
        const [similarData, recommendationsData] = await Promise.all([
            similarResponse.ok ? similarResponse.json() : {results: []},
            recommendationsResponse.ok ? recommendationsResponse.json() : {results: []}
        ]);
        
        // Combine and deduplicate results, prioritizing recommendations (which are more genre/content-based)
        const allResults = [...(recommendationsData.results || [])];
        
        // Add similar results that aren't already in recommendations
        if (similarData.results) {
            similarData.results.forEach(item => {
                if (!allResults.some(rec => rec.id === item.id)) {
                    allResults.push(item);
                }
            });
        }
        
        if (allResults.length === 0) {
            console.log(`No similar content found for ${media.title}`);
            return [];
        }
        
        // Sort results by popularity and vote_average for better recommendations
        allResults.sort((a, b) => {
            // Enhanced scoring that prioritizes content-based factors:
            // - Vote average (quality) is weighted more heavily
            // - Vote count is considered (more votes = more reliable rating)
            // - Release date recency is a minor factor
            
            // Get year if available (default to current year if not)
            const yearA = new Date(a.release_date || a.first_air_date || new Date()).getFullYear();
            const yearB = new Date(b.release_date || b.first_air_date || new Date()).getFullYear();
            
            // Calculate years from current year (for recency factor)
            const currentYear = new Date().getFullYear();
            const yearsFromCurrentA = Math.max(0, currentYear - yearA);
            const yearsFromCurrentB = Math.max(0, currentYear - yearB);
            
            // Normalized vote count (capped at 1000 for fairness to newer content)
            const voteCountFactorA = Math.min(a.vote_count || 0, 1000) / 1000;
            const voteCountFactorB = Math.min(b.vote_count || 0, 1000) / 1000;
            
            // Final score calculation with adjusted weights:
            // - Rating (quality): 50%
            // - Popularity: 30%
            // - Vote count reliability: 15%
            // - Recency: 5%
            const scoreA = 
                (a.vote_average || 0) * 5 + 
                (a.popularity || 0) * 0.3 + 
                voteCountFactorA * 1.5 -
                (yearsFromCurrentA * 0.05);
                
            const scoreB = 
                (b.vote_average || 0) * 5 + 
                (b.popularity || 0) * 0.3 + 
                voteCountFactorB * 1.5 -
                (yearsFromCurrentB * 0.05);
                
            return scoreB - scoreA;
        });
        
        // Map the TMDB results to our app's format (take top 30 for more variety)
        const mapped = allResults.slice(0, 30).map(item => ({
            id: item.id,
            title: item.title || item.name,
            posterUrl: item.poster_path ? `${TMDB_IMG_BASE_URL}${item.poster_path}` : null,
            year: new Date(item.release_date || item.first_air_date || '').getFullYear() || '',
            rating: item.vote_average,
            overview: item.overview,
            media_type: mediaType
        }));
        
        console.log(`Mapped ${mapped.length} similar media items based on content similarity`);
        return mapped;
    } catch (error) {
        console.error('Error fetching similar media:', error);
        return [];
    }
}

async function fetchTMDBSearch(query, mediaType = 'multi') {
    console.log(`Searching TMDB for: "${query}" with type: ${mediaType}`);
    try {
        const url = `${TMDB_API_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
        
        console.log(`Making TMDB search API call to: ${TMDB_API_URL}/search/${mediaType}`);
        const response = await fetch(url);
        console.log(`TMDB search API response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Failed to search TMDB: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            console.log(`No results found for "${query}"`);
            return [];
        }
        
        // Map the TMDB results to our app's format
        const filtered = data.results.filter(item => item.media_type !== 'person');
        console.log(`Found ${data.results.length} total results, ${filtered.length} after filtering`);
        
        const mapped = filtered.map(item => {
            const isMovie = item.media_type === 'movie' || (!item.media_type && item.title);
            return {
                id: item.id,
                title: isMovie ? item.title : item.name,
                posterUrl: item.poster_path ? `${TMDB_IMG_BASE_URL}${item.poster_path}` : null,
                backdropUrl: item.backdrop_path ? `${TMDB_IMG_BASE_URL}${item.backdrop_path}` : null,
                year: new Date(isMovie ? item.release_date : item.first_air_date || '').getFullYear() || '',
                rating: item.vote_average,
                overview: item.overview,
                media_type: item.media_type || (isMovie ? 'movie' : 'tv')
            };
        });
        
        console.log(`Mapped ${mapped.length} search results`);
        return mapped;
    } catch (error) {
        console.error('Error searching TMDB:', error);
        throw error;
    }
}

async function fetchTMDBGenreMovies(genreId) {
    console.log(`Fetching movies for genre ID: ${genreId}`);
    try {
        const url = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
        
        console.log(`Making TMDB genre API call to: ${TMDB_API_URL}/discover/movie`);
        const response = await fetch(url);
        console.log(`TMDB genre API response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch genre movies: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            console.log(`No movies found for genre ${genreId}`);
            return [];
        }
        
        // Map the TMDB results to our app's format
        const mapped = data.results.map(item => ({
            id: item.id,
            title: item.title,
            posterUrl: item.poster_path ? `${TMDB_IMG_BASE_URL}${item.poster_path}` : null,
            backdropUrl: item.backdrop_path ? `${TMDB_IMG_BASE_URL}${item.backdrop_path}` : null,
            year: new Date(item.release_date || '').getFullYear() || '',
            rating: item.vote_average,
            overview: item.overview,
            media_type: 'movie'
        }));
        
        console.log(`Mapped ${mapped.length} genre movies`);
        return mapped;
    } catch (error) {
        console.error('Error fetching genre movies:', error);
        throw error;
    }
}

// Fetch trending media (movies or TV shows)
async function fetchTrending(mediaType = 'movie', timeWindow = 'week') {
    console.log(`Fetching trending ${mediaType}s for ${timeWindow}`);
    try {
        const url = `${TMDB_API_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}`;
        
        console.log(`Making TMDB trending API call to: ${TMDB_API_URL}/trending/${mediaType}/${timeWindow}`);
        const response = await fetch(url);
        console.log(`TMDB trending API response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch trending ${mediaType}s: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            console.log(`No trending ${mediaType}s found`);
            return [];
        }
        
        // Map the TMDB results to our app's format
        const mapped = data.results.map(item => {
            const isMovie = mediaType === 'movie' || (mediaType === 'all' && item.media_type === 'movie');
            return {
                id: item.id,
                title: isMovie ? item.title : item.name,
                posterUrl: item.poster_path ? `${TMDB_IMG_BASE_URL}${item.poster_path}` : null,
                backdropUrl: item.backdrop_path ? `${TMDB_IMG_BASE_URL}${item.backdrop_path}` : null,
                year: new Date(isMovie ? item.release_date : item.first_air_date || '').getFullYear() || '',
                rating: item.vote_average,
                overview: item.overview,
                genre: getMainGenre(item.genre_ids),
                media_type: isMovie ? 'movie' : 'tv'
            };
        });
        
        console.log(`Mapped ${mapped.length} trending ${mediaType}s`);
        return mapped;
    } catch (error) {
        console.error(`Error fetching trending ${mediaType}s:`, error);
        return [];
    }
}

// Helper function to get main genre name from genre IDs
function getMainGenre(genreIds = []) {
    if (!genreIds || genreIds.length === 0) return '';
    
    // Common genre ID to name mapping for TMDB
    const genreMap = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Sci-Fi',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western',
        // TV genres
        10759: 'Action & Adventure',
        10762: 'Kids',
        10763: 'News',
        10764: 'Reality',
        10765: 'Sci-Fi & Fantasy',
        10766: 'Soap',
        10767: 'Talk',
        10768: 'War & Politics'
    };
    
    // Return the first available genre name
    for (const id of genreIds) {
        if (genreMap[id]) return genreMap[id];
    }
    
    return '';
}

export {
    fetchGenreRecommendations,
    fetchSimilarityRecommendations,
    fetchMediaTrailer,
    fetchSimilarMedia,
    fetchTMDBSearch,
    fetchTMDBGenreMovies,
    fetchTrending
}; 