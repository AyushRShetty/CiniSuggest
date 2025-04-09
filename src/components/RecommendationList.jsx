import React, { useState, useEffect } from 'react';
import RecommendationCard from './RecommendationCard';
import DetailsModal from './DetailsModal';
import { motion, AnimatePresence } from 'framer-motion'; // Add AnimatePresence
import { useWatchlist } from '../contexts/WatchlistContext';

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05 // Speed up stagger a bit for many items
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function RecommendationList({ recommendations }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Increased from default 10
  
  // Calculate total pages
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = recommendations.slice(indexOfFirstItem, indexOfLastItem);
  
  // Reset to first page when recommendations change
  useEffect(() => {
    setCurrentPage(1);
  }, [recommendations]);
  
  // Handle page changes
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of recommendations
    window.scrollTo({ top: document.getElementById('recommendations-container').offsetTop - 50, behavior: 'smooth' });
  };
  
  if (!recommendations || recommendations.length === 0) {
    return null; // Or a message indicating no results
  }
  
  const handleCardClick = (media) => {
    // Ensure media has all required properties for TMDB API
    const enhancedMedia = {
      ...media,
      // Make sure media_type is set (default to 'movie' if not specified)
      media_type: media.media_type || (media.first_air_date ? 'tv' : 'movie')
    };
    
    setSelectedMedia(enhancedMedia);
  };
  
  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Found {recommendations.length} recommendations
        </h2>
        
        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="items-per-page" className="text-sm text-gray-600 dark:text-gray-400">
            Items per page:
          </label>
          <select 
            id="items-per-page"
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
          >
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </div>
      </div>
      
      {/* Recommendations grid */}
      <div id="recommendations-container" className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {currentItems.map((item) => (
              <motion.div key={item.id || item.title} variants={itemVariants}>
                <RecommendationCard 
                  media={item} 
                  onClick={handleCardClick}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300'
            }`}
          >
            Previous
          </button>
          
          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show 5 pages at most, centered around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white dark:bg-purple-700'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Details Modal */}
      {selectedMedia && (
        <DetailsModal
          media={selectedMedia}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default RecommendationList; 