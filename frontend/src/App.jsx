import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { API_BASE } from './api';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Categories = lazy(() => import('./pages/Categories'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const backgroundGalleryImages = [
  'https://picsum.photos/seed/phototribe-1/900/700',
  'https://picsum.photos/seed/phototribe-2/900/700',
  'https://picsum.photos/seed/phototribe-3/900/700',
  'https://picsum.photos/seed/phototribe-4/900/700',
  'https://picsum.photos/seed/phototribe-5/900/700',
  'https://picsum.photos/seed/phototribe-6/900/700',
  'https://picsum.photos/seed/phototribe-7/900/700',
  'https://picsum.photos/seed/phototribe-8/900/700',
  'https://picsum.photos/seed/phototribe-9/900/700',
  'https://picsum.photos/seed/phototribe-10/900/700',
  'https://picsum.photos/seed/phototribe-11/900/700',
  'https://picsum.photos/seed/phototribe-12/900/700',
];

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [headerProfilePhoto, setHeaderProfilePhoto] = useState('');
  const [avatarVersion, setAvatarVersion] = useState(localStorage.getItem('profilePhotoVersion') || '0');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const buildAvatarSrc = (src) => {
    if (!src) return '';
    if (src.startsWith('data:')) return src;
    const delimiter = src.includes('?') ? '&' : '?';
    return `${src}${delimiter}v=${avatarVersion}`;
  };

  const resolveHeaderPhoto = (photo) => {
    if (!photo) {
      setHeaderProfilePhoto('');
      setAvatarLoadError(false);
      return;
    }

    const src = buildAvatarSrc(photo);
    const probe = new Image();
    probe.onload = () => {
      setAvatarLoadError(false);
      setHeaderProfilePhoto(photo);
    };
    probe.onerror = () => {
      setAvatarLoadError(true);
      setHeaderProfilePhoto('');
      localStorage.removeItem('profilePhoto');
    };
    probe.src = src;
  };

  useEffect(() => {
    if (!token) {
      setHeaderProfilePhoto('');
      return;
    }

    const cachedPhoto = localStorage.getItem('profilePhoto') || '';
    if (cachedPhoto) {
      resolveHeaderPhoto(cachedPhoto);
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const photo = data?.profilePhoto || '';
        resolveHeaderPhoto(photo);
        if (photo) {
          localStorage.setItem('profilePhoto', photo);
        }
      } catch {
        // Keep icon fallback if profile fetch fails.
      }
    };

    const syncProfilePhoto = () => {
      setAvatarVersion(localStorage.getItem('profilePhotoVersion') || String(Date.now()));
      resolveHeaderPhoto(localStorage.getItem('profilePhoto') || '');
    };

    window.addEventListener('profile-photo-updated', syncProfilePhoto);
    window.addEventListener('storage', syncProfilePhoto);

    fetchCurrentUser();

    return () => {
      window.removeEventListener('profile-photo-updated', syncProfilePhoto);
      window.removeEventListener('storage', syncProfilePhoto);
    };
  }, [token]);

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <style>{`
        .profile-menu-container {
          position: relative;
          display: inline-block;
        }

        .profile-photo-btn {
          background: transparent !important;
          border: 2px solid #007bff !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          min-height: 40px !important;
          padding: 0 !important;
          cursor: pointer;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1.2em !important;
          line-height: 1 !important;
          color: #007bff !important;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: none !important;
        }

        .profile-photo-btn img {
          width: 100% !important;
          height: 100% !important;
          min-width: 100% !important;
          min-height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          border-radius: 50% !important;
          flex-shrink: 0;
        }

        .profile-photo-btn:hover {
          background: #007bff;
          color: white;
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          min-width: 200px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          margin-top: 10px;
          z-index: 1000;
        }

        .profile-dropdown a,
        .profile-dropdown button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 15px;
          text-decoration: none;
          color: #333;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.3s;
        }

        .profile-dropdown a:hover,
        .profile-dropdown button:hover {
          background: rgba(0, 123, 255, 0.1);
        }

        .profile-dropdown a:first-child,
        .profile-dropdown button:first-child {
          border-top: none;
        }

        .profile-dropdown button {
          color: #dc3545;
        }

        .profile-dropdown button:hover {
          background: rgba(220, 53, 69, 0.1);
        }
      `}</style>

      <div className="background-gallery" aria-hidden="true">
        {backgroundGalleryImages.map((imageUrl, index) => (
          <div className="background-gallery-tile" key={`bg-image-${index}`}>
            <img src={imageUrl} alt="" loading="lazy" />
          </div>
        ))}
        <div className="background-gallery-overlay" />
      </div>

      <div className="app-content">
        <header className="topbar">
          <div className="brand-block">
            <Link to="/" className="brand-link">
              <img className="brand-logo" src="/phototribe-logo.svg" alt="PhotoTribe logo" />
              <span className="brand">PhotoTribe</span>
            </Link>
            <p className="brand-tagline">Frame moments. Share stories.</p>
          </div>
          <nav>
            <Link to="/">Gallery</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">About</Link>
            {token ? (
              <>
                {(userRole === 'ROLE_ADMIN' || userRole === 'ROLE_MODERATOR') && <Link to="/admin-dashboard">Admin</Link>}
                <div className="profile-menu-container">
                  <button 
                    className="profile-photo-btn" 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    title="Profile Menu"
                  >
                    {headerProfilePhoto && !avatarLoadError ? (
                      <img
                        src={buildAvatarSrc(headerProfilePhoto)}
                        alt="Profile"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      <FaUser size={18} style={{ color: '#007bff' }} />
                    )}
                  </button>
                  {showProfileMenu && (
                    <div className="profile-dropdown">
                      <Link to="/profile"><FaUser /> My Profile</Link>
                      <Link to="/profile"><FaCog /> Account Settings</Link>
                      <button onClick={logout}><FaSignOutAlt /> Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>

        <section className="quote-banner" aria-label="Photography quote">
          "Photography is the art of freezing emotion in light."
        </section>

        <main className="page-container">
          <Suspense fallback={<div className="alert">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<Gallery token={token} username={username} />} />
              <Route path="/about" element={<About />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" replace />} />
              <Route path="/admin-dashboard" element={token && (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_MODERATOR') ? <AdminDashboard /> : <Navigate to="/" replace />} />
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
              <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="footer">
          <p className="footer-title">PhotoTribe</p>
          <p className="footer-quote">"Every photo has a heartbeat behind it."</p>
          <p className="footer-copy">© {new Date().getFullYear()} Vamsi. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
