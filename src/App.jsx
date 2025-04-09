import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import RecommendationList from './components/RecommendationList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import LandingPage from './components/LandingPage';
import GenreQuickAccess from './components/GenreQuickAccess';
import Watchlist from './components/Watchlist';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { motion } from 'framer-motion';
import { 
  fetchGenreRecommendations, 
  fetchSimilarityRecommendations,
  fetchTMDBSearch,
  fetchTMDBGenreMovies 
} from './services/apiClient';

function App() {
  console.log("App component initializing"); // Debug log
  
  try {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeTab, setActiveTab] = useState('discover');

    const handleSearch = useCallback(async (searchTerm, searchType) => {
      console.log("handleSearch called with:", searchTerm, searchType); // Debug log
      if (!searchTerm.trim()) return;
      
      setIsLoading(true);
      setError(null);
      setRecommendations([]);
      setHasSearched(true); // Mark that a search has been performed
      setActiveTab('discover'); // Switch to discover tab when searching

      try {
        let results;
        
        if (searchType === 'direct') {
          // Use the TMDB search API directly
          console.log("Using direct TMDB search"); // Debug log
          results = await fetchTMDBSearch(searchTerm);
        } else if (searchType === 'genre') {
          // First try mock API
          try {
            results = await fetchGenreRecommendations(searchTerm);
          } catch (err) {
            console.log('Falling back to direct TMDB API for genre search');
            // Fall back to direct TMDB API using a hardcoded genre mapping
            const genreMap = {
              'action': 28,
              'comedy': 35,
              'drama': 18,
              'horror': 27,
              'romance': 10749,
              'sci-fi': 878,
              'thriller': 53,
              'fantasy': 14,
              'animation': 16,
              'adventure': 12,
              'crime': 80,
              'mystery': 9648,
              'family': 10751,
              'documentary': 99
            };
            
            const genreId = genreMap[searchTerm.toLowerCase()] || 28; // Default to action if not found
            results = await fetchTMDBGenreMovies(genreId);
          }
        } else {
          // Try the mock similarity API first
          try {
            results = await fetchSimilarityRecommendations(searchTerm);
          } catch (err) {
            console.log('Falling back to direct TMDB API search');
            // Fall back to direct TMDB API search
            results = await fetchTMDBSearch(searchTerm);
          }
        }
        
        console.log("Search results:", results ? results.length : 0); // Debug log
        setRecommendations(results || []); // Ensure results is an array
        if (!results || results.length === 0) {
          setError('No recommendations found. Try a different search!');
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError(err.message || 'Failed to fetch recommendations. Please check your connection or API keys.');
      } finally {
        setIsLoading(false);
      }
    }, []);

    const handleGenreSelect = async (genre) => {
      console.log("Genre selected:", genre); // Debug log
      setActiveTab('discover');
      await handleSearch(genre, 'genre');
    };

    console.log("App about to render, hasSearched:", hasSearched); // Debug log

    // When a search is performed, show the results page, otherwise show the landing page
    try {
      return (
        <WatchlistProvider>
          <div className="min-h-screen bg-gray-900">
            {(() => {
              try {
                return !hasSearched ? (
                  // Show the landing page if no search has been performed
                  <LandingPage onSearch={handleSearch} />
                ) : (
                  // Show the results page after search
                  <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
                    <header className="text-center mb-8">
                      <h1 
                        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 pt-2 cursor-pointer"
                        onClick={() => setHasSearched(false)}
                      >
                        CiniSuggest
                      </h1>
                      <p className="text-lg text-gray-400 mb-6">Discover your next favorite movie or TV show!</p>
                      
                      {/* Navigation Tabs */}
                      <div className="flex justify-center mb-6">
                        <nav className="flex space-x-1 rounded-xl bg-gray-800 p-1">
                          <button
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              activeTab === 'discover'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('discover')}
                          >
                            Discover
                          </button>
                          <button
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              activeTab === 'watchlist'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('watchlist')}
                          >
                            My Watchlist
                          </button>
                        </nav>
                      </div>
                    </header>

                    <main className="flex-grow">
                      {(() => {
                        try {
                          if (activeTab === 'discover') {
                            return (
                              <>
                                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                                
                                <div className="my-8">
                                  <GenreQuickAccess onGenreSelect={handleGenreSelect} />
                                </div>

                                {isLoading && <LoadingSpinner />}
                                {error && <ErrorMessage message={error} />}
                                {!isLoading && !error && recommendations.length > 0 && (
                                  <RecommendationList recommendations={recommendations} />
                                )}
                                {!isLoading && !error && recommendations.length === 0 && !error && (
                                  <div className="text-center mt-12">
                                    <p className="text-gray-500 mb-4">No recommendations found. Try a different search term.</p>
                                    <button
                                      onClick={() => setHasSearched(false)}
                                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                                    >
                                      Return to Home
                                    </button>
                                  </div>
                                )}
                              </>
                            );
                          } else if (activeTab === 'watchlist') {
                            return (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Watchlist />
                              </motion.div>
                            );
                          }
                          return null;
                        } catch (error) {
                          console.error("Error in tab content rendering:", error);
                          return <div className="text-red-500 p-4">Error rendering tab content: {error.message}</div>;
                        }
                      })()}
                    </main>

                    <footer className="text-center mt-12 py-4 border-t border-gray-700">
                      <p className="text-sm text-gray-500">
                        CiniSuggest | Powered by React, Tailwind CSS, TMDB & AI
                      </p>
                    </footer>
                  </div>
                );
              } catch (error) {
                console.error("Error in main render condition:", error);
                return <div className="text-red-500 p-4">Error rendering application: {error.message}</div>;
              }
            })()}
          </div>
        </WatchlistProvider>
      );
    } catch (error) {
      console.error("Error in return statement:", error);
      return (
        <div className="p-4 bg-red-100 text-red-800 m-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Application Error</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Application
          </button>
        </div>
      );
    }
  } catch (error) {
    console.error("Fatal error initializing App component:", error);
    return (
      <div className="p-4 bg-red-100 text-red-800 m-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Fatal Application Error</h2>
        <p>{error.message}</p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
          {error.stack}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Application
        </button>
      </div>
    );
  }
}

export default App; 