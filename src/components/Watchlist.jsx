import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWatchlist } from '../contexts/WatchlistContext';
import DetailsModal from './DetailsModal';

const Watchlist = () => {
  const { watchlist, removeFromWatchlist, isInWatchlist, clearWatchlist } = useWatchlist();
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Empty state
  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gray-800 rounded-full p-6 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
        <p className="text-gray-400 max-w-md mb-6">Start adding movies and TV shows you want to watch later.</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
        >
          Find Something to Watch
        </button>
      </div>
    );
  }
  
  const handleSelectMedia = (media) => {
    // Ensure media has all required properties for TMDB API
    const enhancedMedia = {
      ...media,
      // Make sure media_type is set (default to 'movie' if not specified)
      media_type: media.media_type || (media.first_air_date ? 'tv' : 'movie')
    };
    
    setSelectedMedia(enhancedMedia);
  };
  
  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">My Watchlist</h2>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
              clearWatchlist();
            }
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
        >
          Clear All
        </button>
      </div>
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {watchlist.map((media) => (
          <motion.div
            key={media.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex flex-col"
            layoutId={`watchlist-${media.id}`}
            whileHover={{ y: -5 }}
          >
            {/* Poster */}
            <div 
              className="relative aspect-[2/3] w-full cursor-pointer"
              onClick={() => handleSelectMedia(media)}
            >
              <img 
                src={media.posterUrl || 'https://via.placeholder.com/500x750/2d3748/6b7280?text=No+Poster'} 
                alt={media.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                <span className="text-white text-sm font-medium">View Details</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-sm font-semibold text-white truncate mb-1" title={media.title}>
                {media.title}
              </h3>
              
              <div className="flex justify-between items-center mt-auto">
                {media.rating && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-yellow-500 text-xs">{media.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(media);
                  }}
                  className="ml-auto text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="Remove from watchlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Details Modal */}
      {selectedMedia && (
        <DetailsModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onAddToWatchlist={() => {}} // Already in watchlist
          isInWatchlist={true}
          onRemoveFromWatchlist={removeFromWatchlist}
        />
      )}
    </div>
  );
};

export default Watchlist; 