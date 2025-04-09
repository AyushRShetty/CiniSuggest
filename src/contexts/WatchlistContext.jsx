import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const WatchlistContext = createContext();

// Custom hook to use the watchlist context
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

// Provider component
export const WatchlistProvider = ({ children }) => {
  // Initialize state from localStorage or empty array
  const [watchlist, setWatchlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load watchlist from localStorage on mount
  useEffect(() => {
    const storedWatchlist = localStorage.getItem('watchlist');
    if (storedWatchlist) {
      try {
        setWatchlist(JSON.parse(storedWatchlist));
      } catch (error) {
        console.error('Failed to parse watchlist:', error);
        setWatchlist([]);
      }
    }
    setIsLoaded(true);
  }, []);
  
  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);
  
  // Add to watchlist
  const addToWatchlist = (media) => {
    // Prevent duplicates
    if (!watchlist.some(item => item.id === media.id)) {
      setWatchlist([...watchlist, media]);
      return true;
    }
    return false;
  };
  
  // Remove from watchlist
  const removeFromWatchlist = (media) => {
    setWatchlist(watchlist.filter(item => item.id !== media.id));
  };
  
  // Check if item is in watchlist
  // Now accepts either a media object or just an ID
  const isInWatchlist = (mediaOrId) => {
    const id = typeof mediaOrId === 'object' ? mediaOrId.id : mediaOrId;
    return watchlist.some(item => item.id === id);
  };
  
  // Clear watchlist
  const clearWatchlist = () => {
    setWatchlist([]);
  };
  
  // Context value object
  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
    isLoaded
  };
  
  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistContext; 