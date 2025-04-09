import React, { useState, useRef } from 'react';

function SearchBar({ onSearch, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('direct'); // 'genre', 'title', or 'direct'
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || isLoading) return;
    onSearch(searchTerm.trim(), searchType);
    // Optional: Clear input after search
    // setSearchTerm('');
  };

  const getPlaceholder = () => {
    switch(searchType) {
      case 'genre':
        return 'Enter a genre (e.g., Sci-Fi, Comedy)';
      case 'title':
        return 'Enter a movie/show title for similar recommendations';
      case 'direct':
        return 'Search movies and TV shows by title';
      default:
        return 'Search for movies and TV shows';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md">
        <div className="px-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            disabled={isLoading}
            className="bg-gray-800 text-white outline-none appearance-none py-3 pr-2 cursor-pointer text-sm"
          >
            <option value="direct">Direct Search</option>
            <option value="genre">Genre</option>
            <option value="title">Similar Titles</option>
          </select>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={getPlaceholder()}
          className="flex-grow p-3 bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className={`px-6 py-3 font-semibold transition-colors duration-200 
                      ${isLoading || !searchTerm.trim() 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'}`}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}

export default SearchBar; 