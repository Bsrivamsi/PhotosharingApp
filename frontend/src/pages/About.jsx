import React, { useState } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaStar, FaComments, FaUser } from 'react-icons/fa';

const About = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5
  });

  const [comments, setComments] = useState([
    {
      id: 1,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      comment: 'PhotoTribe is an amazing platform! The category organization makes it so easy to discover amazing artwork.',
      rating: 5,
      userType: 'Photographer',
      date: '2025-04-01'
    },
    {
      id: 2,
      name: 'Alex Turner',
      email: 'alex@example.com',
      comment: 'Love the features! The auto-category generation is incredibly helpful. Great community here.',
      rating: 5,
      userType: 'Member',
      date: '2025-03-28'
    },
    {
      id: 3,
      name: 'Guest User',
      email: 'guest@example.com',
      comment: 'Even without an account, I can browse amazing photos. This is the best photo sharing platform!',
      rating: 4,
      userType: 'Visitor',
      date: '2025-03-25'
    }
  ]);

  const [submitStatus, setSubmitStatus] = useState('');

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      // In production, this would send to backend
      console.log('Contact form submitted:', contactForm);
      setSubmitStatus('Contact message sent successfully!');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('Error sending contact message');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      // In production, this would send to backend
      const newComment = {
        id: comments.length + 1,
        name: feedbackForm.name,
        email: feedbackForm.email,
        comment: feedbackForm.message,
        rating: feedbackForm.rating,
        userType: 'Member',
        date: new Date().toISOString().split('T')[0]
      };
      setComments([newComment, ...comments]);
      setSubmitStatus('Thank you! Your feedback has been posted.');
      setFeedbackForm({ name: '', email: '', message: '', rating: 5 });
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('Error submitting feedback');
    }
  };

  return (
    <div className="about-page">
      <style>{`
        .about-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .about-header {
          text-align: center;
          margin-bottom: 50px;
          color: white;
        }

        .about-header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .about-header p {
          font-size: 1.1em;
          color: #ccc;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-content {
          background: rgba(255, 255, 255, 0.05);
          padding: 40px;
          border-radius: 15px;
          margin-bottom: 50px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .about-content h2 {
          color: white;
          font-size: 2em;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .about-content p {
          color: #ddd;
          font-size: 1.05em;
          line-height: 1.8;
          margin-bottom: 15px;
        }

        .features-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .feature-item {
          background: rgba(59, 130, 246, 0.1);
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #3b82f6;
        }

        .feature-item h3 {
          color: #3b82f6;
          margin-bottom: 10px;
          font-size: 1.2em;
        }

        .feature-item p {
          color: #ccc;
          font-size: 0.95em;
          margin: 0;
        }

        .comments-section {
          margin-bottom: 50px;
        }

        .comments-section h2 {
          color: white;
          font-size: 2em;
          margin-bottom: 30px;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        .comments-container {
          display: grid;
          gap: 20px;
        }

        .comment-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 25px;
          border-radius: 10px;
          border-left: 4px solid #fbbf24;
          backdrop-filter: blur(10px);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .comment-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .comment-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2em;
        }

        .comment-name {
          color: white;
          font-weight: 600;
          font-size: 1.1em;
        }

        .comment-type {
          background: #3b82f6;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
        }

        .comment-date {
          color: #999;
          font-size: 0.9em;
        }

        .comment-rating {
          color: #fbbf24;
          font-size: 0.95em;
        }

        .comment-text {
          color: #ddd;
          line-height: 1.6;
          font-size: 1em;
        }

        .forms-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 50px;
        }

        .form-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 30px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-section h3 {
          color: white;
          margin-bottom: 20px;
          font-size: 1.5em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          color: white;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #555;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-family: inherit;
          font-size: 0.95em;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #999;
        }

        .submit-btn {
          background: #007bff;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
          width: 100%;
          transition: all 0.3s;
        }

        .submit-btn:hover {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 86, 179, 0.3);
        }

        .status-message {
          color: #90EE90;
          text-align: center;
          margin-top: 10px;
          font-weight: 600;
        }

        .status-message.error {
          color: #FF6B6B;
        }

        @media (max-width: 768px) {
          .forms-container {
            grid-template-columns: 1fr;
          }

          .about-header h1 {
            font-size: 1.8em;
          }

          .features-list {
            grid-template-columns: 1fr;
          }

          .about-content {
            padding: 25px;
          }
        }
      `}</style>

      <div className="about-header">
        <h1>About PhotoTribe</h1>
        <p>Welcome to PhotoTribe - Your Creative Photo Sharing Community. 
           Share your moments, discover artwork, and connect with photographers worldwide.</p>
      </div>

      <div className="about-content">
        <h2>
          <FaComments /> What is PhotoTribe?
        </h2>
        <p>
          PhotoTribe is a modern, intuitive photo-sharing platform designed for photographers, artists, and photo enthusiasts of all levels. 
          Whether you're a professional photographer looking to showcase your portfolio or a casual photo lover wanting to discover amazing imagery, 
          PhotoTribe provides the perfect community.
        </p>
        <p>
          Our platform combines powerful features with an intuitive interface to make photo sharing, discovery, and community interaction seamless and enjoyable. 
          From automatic category organization to interactive engagement tools, every feature is designed with the photographer in mind.
        </p>

        <h2 style={{ marginTop: '30px' }}>Key Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <h3>Smart Categories</h3>
            <p>Automatic category detection or manual assignment makes organizing and discovering photos effortless.</p>
          </div>
          <div className="feature-item">
            <h3>Easy Sharing</h3>
            <p>Share your photos across social media platforms and generate QR codes to showcase your work.</p>
          </div>
          <div className="feature-item">
            <h3>Community Engagement</h3>
            <p>Like, follow, comment, and connect with other photographers and photo enthusiasts in real-time.</p>
          </div>
          <div className="feature-item">
            <h3>Multiple Format Support</h3>
            <p>Upload photos in any format - JPG, PNG, JFIF, WebP, and more. We handle the rest.</p>
          </div>
          <div className="feature-item">
            <h3>Secure & Reliable</h3>
            <p>Your photos are securely stored with JWT authentication and encrypted connections.</p>
          </div>
          <div className="feature-item">
            <h3>Browse Freely</h3>
            <p>Explore the gallery as a guest or create an account to upload and share your own photos.</p>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h2>
          <FaComments /> User Comments & Testimonials
        </h2>
        <div className="comments-container">
          {comments.map((c) => (
            <div key={c.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-avatar">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="comment-name">{c.name}</div>
                    <div className="comment-type">{c.userType}</div>
                  </div>
                </div>
                <div>
                  <div className="comment-date">{c.date}</div>
                  <div className="comment-rating">
                    {'⭐'.repeat(c.rating)}
                  </div>
                </div>
              </div>
              <p className="comment-text">"{c.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="forms-container">
        <div className="form-section">
          <h3><FaEnvelope /> Contact Us</h3>
          <form onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleContactChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
                placeholder="Message subject"
                required
              />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder="Your message here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
            {submitStatus && !submitStatus.includes('feedback') && (
              <p className={`status-message ${submitStatus.includes('Error') ? 'error' : ''}`}>{submitStatus}</p>
            )}
          </form>
        </div>

        <div className="form-section">
          <h3><FaStar /> Send Feedback</h3>
          <form onSubmit={handleFeedbackSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={feedbackForm.name}
                onChange={handleFeedbackChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={feedbackForm.email}
                onChange={handleFeedbackChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select
                name="rating"
                value={feedbackForm.rating}
                onChange={handleFeedbackChange}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Your Feedback *</label>
              <textarea
                name="message"
                value={feedbackForm.message}
                onChange={handleFeedbackChange}
                placeholder="Share your thoughts about PhotoTribe..."
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Post Feedback</button>
            {submitStatus && submitStatus.includes('feedback') && (
              <p className={`status-message ${submitStatus.includes('Error') ? 'error' : ''}`}>{submitStatus}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default About;
