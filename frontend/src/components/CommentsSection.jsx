import React, { useState, useEffect } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE } from '../api';
import './CommentsSection.css';

const emojis = ['😀', '😂', '❤️', '👍', '🎉', '😍', '🔥', '💯', '😎', '🚀', '✨', '😇'];

const CommentsSection = ({ photoId, token, username, compact = false, isDemo = false }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [photoId]);

  const fetchComments = async () => {
    if (isDemo) {
      const key = `demo-comments-${photoId}`;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        setComments(Array.isArray(parsed) ? parsed : []);
      } catch {
        setComments([]);
      }
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/comments/photo/${photoId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    if (isDemo) {
      const key = `demo-comments-${photoId}`;
      const demoComment = {
        id: Date.now(),
        text: newComment.trim(),
        createdAt: new Date().toISOString(),
        user: { username: username || 'You' },
      };
      const nextComments = [demoComment, ...comments];
      setComments(nextComments);
      localStorage.setItem(key, JSON.stringify(nextComments));
      setNewComment('');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/comments/photo/${photoId}`, 
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    if (isDemo) {
      const key = `demo-comments-${photoId}`;
      const nextComments = comments.filter((comment) => comment.id !== commentId);
      setComments(nextComments);
      localStorage.setItem(key, JSON.stringify(nextComments));
      return;
    }

    try {
      await axios.delete(`${API_BASE}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Compact mode - show just an icon button with modal
  if (compact) {
    return (
      <div className="comments-button">
        <button 
          className="comment-icon-btn"
          title={`${comments.length} comments`}
          aria-label="Comments"
          onClick={() => setShowCommentModal(true)}
        >
          <FaComments />
          <span className="comment-count">{comments.length}</span>
        </button>
        
        {showCommentModal && (
          <div className="comment-modal-overlay" onClick={() => setShowCommentModal(false)}>
            <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="comment-modal-header">
                <h3>Comments ({comments.length})</h3>
                <button className="modal-close" onClick={() => setShowCommentModal(false)}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="comment-modal-body">
                <form onSubmit={handleAddComment} className="comment-form-compact">
                  <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={loading || !token}
                  />
                  
                  <div className="emoji-picker">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="emoji-btn"
                        onClick={() => setNewComment(newComment + emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  <button type="submit" disabled={loading || !token} className="submit-comment-btn">
                    {loading ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
                
                <div className="comments-list-modal">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item-modal">
                      <div className="comment-header-modal">
                        <strong>{comment.user?.username || 'Anonymous'}</strong>
                        <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      {username === comment.user?.username && (
                        <button 
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view mode
  const displayedComments = showMore ? comments : comments.slice(0, 3);

  return (
    <div className="comments-section">
      <h4>Comments ({comments.length})</h4>
      
      <form onSubmit={handleAddComment} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading || !token}
        />
        <button type="submit" disabled={loading || !token}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>

      <div className="comments-list">
        {displayedComments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <strong>{comment.user?.username || 'Anonymous'}</strong>
              <span className="comment-time">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="comment-text">{comment.text}</p>
            {username === comment.user?.username && (
              <button 
                className="delete-comment-btn"
                onClick={() => handleDeleteComment(comment.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {comments.length > 3 && (
        <button 
          className="show-more-btn" 
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? 'Show Less' : `Show ${comments.length - 3} More`}
        </button>
      )}
    </div>
  );
};

export default CommentsSection;
