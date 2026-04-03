import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt, FaTrash, FaClock, FaUserFriends, FaCamera } from 'react-icons/fa';
import { API_BASE } from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileBio, setProfileBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [followerStats, setFollowerStats] = useState({ followersCount: 0, followingCount: 0 });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchFollowerStats();
  }, [token, navigate, username]);

  const fetchFollowerStats = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`${API_BASE}/users/${username}/followers`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const localDemoFollowing = Object.keys(localStorage)
        .filter((key) => key.startsWith(`demo-follow-${username}-`) && localStorage.getItem(key) === '1')
        .length;

      setFollowerStats({
        followersCount: response.data.followersCount || 0,
        followingCount: (response.data.followingCount || 0) + localDemoFollowing
      });
    } catch (error) {
      console.error('Error fetching follower stats:', error);

      const localDemoFollowing = Object.keys(localStorage)
        .filter((key) => key.startsWith(`demo-follow-${username}-`) && localStorage.getItem(key) === '1')
        .length;
      setFollowerStats({ followersCount: 0, followingCount: localDemoFollowing });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
      setProfileBio(response.data.profileBio || '');
      setProfilePhoto(response.data.profilePhoto || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Error: Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Error: Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result?.toString() || '');
    reader.readAsDataURL(file);
    setProfilePhotoFile(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      let updatedUser = null;
      const normalizedBio = (profileBio || '').slice(0, 255);
      let photoUpdated = false;
      let bioUpdated = false;

      if (profilePhotoFile) {
        const formData = new FormData();
        formData.append('file', profilePhotoFile);
        const uploadResponse = await axios.post(
          `${API_BASE}/auth/profile/photo`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        updatedUser = uploadResponse.data;
        photoUpdated = true;
      }

      // Update bio only when changed; this avoids unnecessary patch errors.
      const currentBio = (user?.profileBio || '').slice(0, 255);
      if (normalizedBio !== currentBio) {
        try {
          const profileResponse = await axios.patch(
            `${API_BASE}/auth/profile`,
            { profileBio: normalizedBio },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          updatedUser = profileResponse.data || updatedUser;
          bioUpdated = true;
        } catch {
          setProfileBio(currentBio);
        }
      }

      if (updatedUser) {
        setUser(updatedUser);
        const nextPhoto = updatedUser?.profilePhoto || profilePhoto;
        setProfilePhoto(nextPhoto);
        if (nextPhoto) {
          localStorage.setItem('profilePhoto', nextPhoto);
          localStorage.setItem('profilePhotoVersion', String(Date.now()));
          window.dispatchEvent(new Event('profile-photo-updated'));
        }
      }

      setProfilePhotoFile(null);

      if (photoUpdated && !bioUpdated && normalizedBio !== currentBio) {
        setMessage('Profile photo updated, but bio update failed. Please keep bio under 255 characters.');
      } else {
        setMessage('Profile updated successfully!');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error updating profile');
    }
  };

  const handleLogout = () => {
    setConfirmAction('logout');
    setShowConfirm(true);
  };

  const handleDeleteAccount = () => {
    setConfirmAction('delete');
    setShowConfirm(true);
  };

  const handleSuspendAccount = () => {
    setConfirmAction('suspend');
    setShowConfirm(true);
  };

  const confirmAction_ = async () => {
    try {
      if (confirmAction === 'logout') {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
      } else if (confirmAction === 'delete') {
        await axios.delete(`${API_BASE}/auth/account`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
      } else if (confirmAction === 'suspend') {
        await axios.post(
          `${API_BASE}/auth/account/suspend`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
      }
      setShowConfirm(false);
    } catch (error) {
      setMessage('Error performing action');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
  }

  if (!user) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Please log in first</div>;
  }

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .profile-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 40px;
          backdrop-filter: blur(10px);
        }

        .profile-header {
          text-align: center;
          margin-bottom: 30px;
          color: white;
        }

        .profile-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .profile-photo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .profile-photo-preview {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.35);
          object-fit: cover;
          background: rgba(255, 255, 255, 0.12);
        }

        .profile-photo-placeholder {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.12);
        }

        .photo-upload-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          color: white;
          background: rgba(0, 123, 255, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          font-weight: 600;
        }

        .photo-upload-input {
          display: none;
        }

        .profile-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          color: white;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-icon {
          font-size: 1.2em;
          color: #007bff;
          min-width: 30px;
        }

        .info-label {
          font-weight: bold;
          min-width: 80px;
        }

        .info-value {
          color: #ccc;
        }

        .form-section {
          margin-bottom: 30px;
        }

        .form-section h3 {
          color: white;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          color: white;
          margin-bottom: 5px;
        }

        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #555;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
        }

        .form-group textarea::placeholder {
          color: #999;
        }

        .btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          flex: 1;
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn-warning {
          background: #ffc107;
          color: black;
        }

        .btn-warning:hover {
          background: #e0a800;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .message {
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          color: #90EE90;
          background: rgba(144, 238, 144, 0.1);
        }

        .message.error {
          color: #FF6B6B;
          background: rgba(255, 107, 107, 0.1);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 30px;
          max-width: 400px;
          text-align: center;
          color: white;
          backdrop-filter: blur(10px);
        }

        .modal h3 {
          margin-bottom: 20px;
        }

        .modal p {
          margin-bottom: 25px;
          color: #ccc;
        }

        .modal-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .modal-buttons button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .modal-confirm {
          background: #dc3545;
          color: white;
        }

        .modal-confirm:hover {
          background: #c82333;
        }

        .modal-cancel {
          background: #6c757d;
          color: white;
        }

        .modal-cancel:hover {
          background: #5a6268;
        }
      `}</style>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-photo-wrap">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="profile-photo-preview" />
            ) : (
              <div className="profile-photo-placeholder">
                <FaUser />
              </div>
            )}
          </div>
          <h1><FaUser /> My Profile</h1>
        </div>

        {message && <div className={`message ${message.includes('Error') ? 'error' : ''}`}>{message}</div>}

        <div className="profile-info">
          <div className="info-row">
            <div className="info-icon"><FaUser /></div>
            <div className="info-label">Username:</div>
            <div className="info-value">{user.username}</div>
          </div>
          <div className="info-row">
            <div className="info-icon"><FaEnvelope /></div>
            <div className="info-label">Email:</div>
            <div className="info-value">{user.email}</div>
          </div>
          <div className="info-row">
            <div className="info-icon"><FaClock /></div>
            <div className="info-label">Role:</div>
            <div className="info-value">{user.role}</div>
          </div>
          <div className="info-row">
            <div className="info-icon"><FaUserFriends /></div>
            <div className="info-label">Followers:</div>
            <div className="info-value">{followerStats.followersCount}</div>
          </div>
          <div className="info-row">
            <div className="info-icon"><FaUserFriends /></div>
            <div className="info-label">Following:</div>
            <div className="info-value">{followerStats.followingCount}</div>
          </div>
        </div>

        <div className="form-section">
          <h3>Edit Profile</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Add a bio about yourself..."
                maxLength={255}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Profile Photo</label>
              <label className="photo-upload-label" htmlFor="profile-photo-input">
                <FaCamera /> Upload photo
              </label>
              <input
                id="profile-photo-input"
                className="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Profile</button>
          </form>
        </div>

        <div className="form-section">
          <h3>Account Settings</h3>
          <div className="btn-group">
            <button className="btn btn-warning" onClick={handleSuspendAccount}>
              <FaClock /> Suspend Account (30 days)
            </button>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              <FaTrash /> Delete Account
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {confirmAction === 'logout' && 'Confirm Logout'}
              {confirmAction === 'delete' && 'Delete Account?'}
              {confirmAction === 'suspend' && 'Suspend Account?'}
            </h3>
            <p>
              {confirmAction === 'logout' && 'Are you sure you want to logout?'}
              {confirmAction === 'delete' && 'This action cannot be undone. All your data will be deleted.'}
              {confirmAction === 'suspend' && 'Your account will be suspended for 30 days.'}
            </p>
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={confirmAction_}>Confirm</button>
              <button className="modal-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
