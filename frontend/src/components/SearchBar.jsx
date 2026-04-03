import React, { useState, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE } from '../api';
import './SearchBar.css';

const SearchBar = ({ onSearchResults, allPhotos = [] }) => {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      onSearchResults(null);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      let results = [];
      
      // If allPhotos provided (for Categories page), search locally
      if (allPhotos && allPhotos.length > 0) {
        const lowerQuery = query.toLowerCase();
        results = allPhotos.filter(p =>
          (p.title && p.title.toLowerCase().includes(lowerQuery)) ||
          (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
          (p.uploader && p.uploader.toLowerCase().includes(lowerQuery)) ||
          (p.category && p.category.toLowerCase().includes(lowerQuery))
        );
      } else {
        // Otherwise search via API
        const response = await axios.get(`${API_BASE}/photos/search?keyword=${encodeURIComponent(query)}`);
        results = response.data;
      }
      
      onSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching photos:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [onSearchResults, allPhotos]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setSearchInput('');
    onSearchResults(null);
    setShowResults(false);
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search photos by title, description, photographer, or category..."
          value={searchInput}
          onChange={handleInputChange}
          className="search-input"
        />
        {searchInput && (
          <button className="clear-btn" onClick={handleClear} title="Clear search">
            ×
          </button>
        )}
        {loading && <span className="search-loading">Searching...</span>}
      </div>
      {showResults && searchInput && (
        <div className="search-hint">
          Found results for: <strong>{searchInput}</strong>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
