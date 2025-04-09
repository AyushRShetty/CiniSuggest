import React from 'react';
import { motion } from 'framer-motion';
import { useWatchlist } from '../contexts/WatchlistContext';

// Placeholder image URL (replace with a better one if desired)
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/500x750/1f2937/6b7280?text=No+Poster';

function RecommendationCard({ media, onClick }) {
  const { isInWatchlist } = useWatchlist();
  
  const { title, posterUrl, year, rating, id } = media;
  const displayYear = year ? new Date(year).getFullYear() : null;
  const displayRating = rating ? rating.toFixed(1) : null;
  const inWatchlist = isInWatchlist(id);

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-full flex flex-col cursor-pointer relative"
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(media)}
      layoutId={`card-${id}`}
    >
      {/* Watchlist badge */}
      {inWatchlist && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
          Watchlist
        </div>
      )}
      
      <div className="aspect-[2/3] w-full relative">
        <img
          src={posterUrl || PLACEHOLDER_IMAGE}
          alt={`${title} poster`}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src=PLACEHOLDER_IMAGE }}
          loading="lazy" // Add lazy loading
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <span className="text-white text-sm font-medium">View Details</span>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow justify-between">
        <h3 className="text-sm font-semibold text-white truncate mb-1" title={title}>{title}</h3>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{displayYear || 'N/A'}</span>
          {displayRating && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {displayRating}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default RecommendationCard; 