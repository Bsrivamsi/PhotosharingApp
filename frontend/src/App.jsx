import React from 'react';
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Gallery from './pages/Gallery';

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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="app-shell">
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
            {token ? <button className="link-button" onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
            {!token && <Link to="/register">Register</Link>}
          </nav>
        </header>

        <section className="quote-banner" aria-label="Photography quote">
          "Photography is the art of freezing emotion in light."
        </section>

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Gallery token={token} username={username} />} />
            <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
          </Routes>
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
