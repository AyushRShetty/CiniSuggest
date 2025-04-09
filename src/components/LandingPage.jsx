import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import GenreQuickAccess from './GenreQuickAccess';
import { fetchTrending } from '../services/apiClient';
import DetailsModal from './DetailsModal';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage = ({ onSearch }) => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Fetch trending data on component mount
  useEffect(() => {
    const fetchTrendingData = async () => {
      setIsLoading(true);
      try {
        // Fetch trending movies and TV shows in parallel
        const [moviesData, showsData] = await Promise.all([
          fetchTrending('movie', 'week'),
          fetchTrending('tv', 'week')
        ]);
        
        // Take first 8 items for each category instead of 4
        setTrendingMovies(moviesData.slice(0, 8));
        setTrendingShows(showsData.slice(0, 8));
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendingData();
  }, []);
  
  const handleMediaClick = (media) => {
    setSelectedMedia(media);
  };
  
  const handleCloseModal = () => {
    setSelectedMedia(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-gray-900 to-gray-900"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
              variants={fadeInUp}
            >
              Discover Your Next Favorite
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl"
              variants={fadeInUp}
            >
              Get personalized movie and TV show recommendations based on genre or what you already love.
            </motion.p>
            
            <motion.div 
              className="w-full max-w-3xl mb-12"
              variants={fadeInUp}
            >
              <SearchBar onSearch={onSearch} isLoading={false} />
            </motion.div>

            {/* Genre Quick Selection */}
            <motion.div 
              className="w-full max-w-4xl mb-12"
              variants={fadeInUp}
            >
              <motion.h2 
                className="text-2xl font-bold mb-6 text-white text-center"
                variants={fadeInUp}
              >
                Explore by Genre
              </motion.h2>
              <GenreQuickAccess onGenreSelect={(genre) => onSearch(genre, 'genre')} />
            </motion.div>
            
            {/* Statistics */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center"
              variants={staggerContainer}
            >
              {[
                { label: "Movies & Shows", value: "Millions" },
                { label: "Genres", value: "Every Type" },
                { label: "Search Options", value: "Genre & Title" },
                { label: "AI Powered", value: "Smart Results" }
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp} className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={fadeInUp}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Finding your next binge-worthy content has never been easier. Our AI-powered platform delivers personalized recommendations in seconds.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                title: "Search by Genre",
                description: "Enter your favorite genre and discover the most popular and critically acclaimed titles.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                )
              },
              {
                title: "Search by Title",
                description: "Already have a favorite movie or show? Find similar content based on what you already love.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              {
                title: "Get Details",
                description: "View posters, ratings, and release years for all recommendations to make informed choices.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-gray-800 rounded-xl p-8 text-center flex flex-col items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-purple-500 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Trending Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Explore what everyone's watching right now</p>
          </motion.div>
          
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-purple-400">Movies</h3>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                {trendingMovies.map((movie) => (
                  <motion.div 
                    key={movie.id}
                    variants={fadeInUp}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                    whileHover={{ y: -10 }}
                    onClick={() => handleMediaClick(movie)}
                  >
                    <div className="h-56 md:h-80 w-full overflow-hidden">
                      <img src={movie.posterUrl || 'https://via.placeholder.com/300x450/2d3748/6b7280?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                        <span className="text-white text-sm font-medium">View Details</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white truncate">{movie.title}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-400">{movie.genre}</p>
                        {movie.rating && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-500 text-xs">{movie.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-pink-400">TV Shows</h3>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                {trendingShows.map((show) => (
                  <motion.div 
                    key={show.id}
                    variants={fadeInUp}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                    whileHover={{ y: -10 }}
                    onClick={() => handleMediaClick(show)}
                  >
                    <div className="h-56 md:h-80 w-full overflow-hidden relative">
                      <img src={show.posterUrl || 'https://via.placeholder.com/300x450/2d3748/6b7280?text=No+Poster'} alt={show.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                        <span className="text-white text-sm font-medium">View Details</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white truncate">{show.title}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-400">{show.genre}</p>
                        {show.rating && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-500 text-xs">{show.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 transform -skew-y-6"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              variants={fadeInUp}
            >
              Ready to find your next favorite?
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300 mb-8"
              variants={fadeInUp}
            >
              Start your journey by entering a genre or title you enjoy, and let our AI-powered recommendation engine do the rest.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex justify-center"
            >
              <button 
                onClick={() => document.querySelector('input').focus()}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Details Modal */}
      {selectedMedia && (
        <DetailsModal
          media={selectedMedia}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default LandingPage; 