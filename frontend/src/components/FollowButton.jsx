import React, { useState, useEffect } from 'react';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE } from '../api';
import './FollowButton.css';

const FollowButton = ({ targetUsername, token, currentUsername, isDemo = false }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo && currentUsername && currentUsername !== targetUsername) {
      const followKey = `demo-follow-${currentUsername}-${targetUsername}`;
      const countKey = `demo-followers-${targetUsername}`;
      const savedFollowing = localStorage.getItem(followKey) === '1';
      const savedCount = Number(localStorage.getItem(countKey) || '0');
      setIsFollowing(savedFollowing);
      setFollowersCount(Number.isFinite(savedCount) ? savedCount : 0);
      return;
    }

    if (token && currentUsername && currentUsername !== targetUsername) {
      checkFollowStatus();
    }
  }, [targetUsername, token, currentUsername, isDemo]);

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users/${targetUsername}/followers/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(response.data.isFollowing);
      setFollowersCount(response.data.followersCount || 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleToggleFollow = async () => {
    if (!token) {
      alert('Please login to follow users');
      return;
    }

    if (currentUsername === targetUsername) {
      alert('You cannot follow yourself');
      return;
    }

    if (isDemo) {
      const followKey = `demo-follow-${currentUsername}-${targetUsername}`;
      const countKey = `demo-followers-${targetUsername}`;
      const nextFollowing = !isFollowing;
      const nextCount = Math.max(0, followersCount + (nextFollowing ? 1 : -1));
      setIsFollowing(nextFollowing);
      setFollowersCount(nextCount);
      localStorage.setItem(followKey, nextFollowing ? '1' : '0');
      localStorage.setItem(countKey, String(nextCount));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/users/${targetUsername}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(response.data.isFollowing);
      setFollowersCount(response.data.followersCount || 0);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if it's the current user
  if (currentUsername === targetUsername) {
    return null;
  }

  return (
    <div className="follow-button">
      <button 
        onClick={handleToggleFollow} 
        disabled={loading}
        className={`follow-btn icon-only ${isFollowing ? 'following' : ''}`}
        title={isFollowing ? `Unfollow ${targetUsername} (${followersCount} followers)` : `Follow ${targetUsername}`}
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
      </button>
    </div>
  );
};

export default FollowButton;
