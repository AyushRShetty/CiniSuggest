import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '../contexts/WatchlistContext';
import { fetchMediaTrailer, fetchSimilarMedia } from '../services/apiClient';
import ShareButtons from './ShareButtons';

const DetailsModal = ({ media, onClose }) => {
  const [similarTitles, setSimilarTitles] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [selectedSimilarMedia, setSelectedSimilarMedia] = useState(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const modalRef = useRef(null);
  
  const { id, title, overview, posterUrl, year, rating } = media;
  
  const isInList = isInWatchlist(media);
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trailer and similar titles in parallel
        setTrailerLoading(true);
        setSimilarLoading(true);
        
        const [trailerData, similarData] = await Promise.all([
          fetchMediaTrailer(media),
          fetchSimilarMedia(media)
        ]);
        
        setTrailerKey(trailerData.key);
        setSimilarTitles(similarData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTrailerLoading(false);
        setSimilarLoading(false);
      }
    };
    
    fetchData();
    
    // Disable scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle escape key press
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [media, id]);
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleWatchlistClick = () => {
    if (isInList) {
      removeFromWatchlist(media);
    } else {
      addToWatchlist(media);
    }
  };

  // Handle click on a similar title
  const handleSimilarMediaClick = (similarMedia) => {
    setSelectedSimilarMedia(similarMedia);
  };
  
  // If a similar media is selected, render a new modal for it
  if (selectedSimilarMedia) {
    return (
      <DetailsModal 
        media={selectedSimilarMedia} 
        onClose={() => setSelectedSimilarMedia(null)} 
      />
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div 
        ref={modalRef}
        className="bg-gray-900 rounded-xl overflow-hidden w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Trailer Section */}
        <div className="w-full aspect-video bg-gray-800 relative">
          {trailerLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0`}
              title={`${title} trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>No trailer available</p>
            </div>
          )}
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster and Actions */}
            <div className="md:w-1/3 flex flex-col">
              <div className="aspect-[2/3] w-full mb-4 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={posterUrl || 'https://via.placeholder.com/300x450/2d3748/6b7280?text=No+Poster'} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWatchlistClick}
                  className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                    isInList 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isInList ? 'none' : 'currentColor'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isInList ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                
                <ShareButtons media={media} />
              </div>
            </div>
            
            {/* Details */}
            <div className="md:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {title} {year && <span className="text-gray-400">({year})</span>}
              </h2>
              
              {rating && (
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-yellow-500 font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-gray-400 ml-1">/10</span>
                </div>
              )}
              
              {overview && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                  <p className="text-gray-300 leading-relaxed">{overview}</p>
                </div>
              )}
              
              {/* Similar Titles */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">You Might Also Like</h3>
                
                {similarLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : similarTitles && similarTitles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {similarTitles.map((similar) => (
                      <div 
                        key={similar.id} 
                        className="bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => handleSimilarMediaClick(similar)}
                      >
                        <div className="aspect-[2/3] w-full relative group">
                          <img 
                            src={similar.posterUrl || 'https://via.placeholder.com/150x225/2d3748/6b7280?text=No+Poster'} 
                            alt={similar.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-sm font-medium px-3 py-1 bg-purple-600 rounded-full">View Details</span>
                          </div>
                        </div>
                        <div className="p-2">
                          <h4 className="text-sm font-medium text-white truncate" title={similar.title}>
                            {similar.title}
                          </h4>
                          {similar.rating && (
                            <div className="flex items-center mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-yellow-500 text-xs">{similar.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No similar titles found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DetailsModal; 