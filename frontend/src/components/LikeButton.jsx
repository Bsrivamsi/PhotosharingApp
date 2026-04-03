import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE } from '../api';
import './LikeButton.css';

const LikeButton = ({ photoId, token, username, isDemo = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) {
      const likedKey = `demo-liked-${photoId}-${username || 'guest'}`;
      const countKey = `demo-like-count-${photoId}`;
      const savedLiked = localStorage.getItem(likedKey) === '1';
      const savedCount = Number(localStorage.getItem(countKey) || '0');
      setIsLiked(savedLiked);
      setLikeCount(Number.isFinite(savedCount) ? savedCount : 0);
      return;
    }

    if (token && username) {
      checkLikeStatus();
    }
  }, [photoId, token, username, isDemo]);

  const checkLikeStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/photos/${photoId}/likes/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!token) {
      alert('Please login to like photos');
      return;
    }

    if (isDemo) {
      const likedKey = `demo-liked-${photoId}-${username || 'guest'}`;
      const countKey = `demo-like-count-${photoId}`;
      const nextLiked = !isLiked;
      const nextCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
      setIsLiked(nextLiked);
      setLikeCount(nextCount);
      localStorage.setItem(likedKey, nextLiked ? '1' : '0');
      localStorage.setItem(countKey, String(nextCount));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/photos/${photoId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="like-button">
      <button 
        onClick={handleToggleLike} 
        disabled={loading}
        className={`like-btn ${isLiked ? 'liked' : ''}`}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? <FaHeart /> : <FaRegHeart />}
      </button>
      <span className="like-count">{likeCount}</span>
    </div>
  );
};

export default LikeButton;
