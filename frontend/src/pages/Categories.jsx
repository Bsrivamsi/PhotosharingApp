import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilter } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import { API_BASE } from '../api';

// Sample photos with categories
const samplePhotos = [
  {
    id: 'sample-1',
    title: 'Mountain Sunrise',
    description: 'A crisp morning above the clouds.',
    category: 'Nature',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    uploader: 'Emma Johnson',
    uploadedAt: '2025-10-20T08:30:00Z',
  },
  {
    id: 'sample-2',
    title: 'Autumn Lane',
    description: 'A golden drive through autumn trees.',
    category: 'Nature',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    uploader: 'Alex Carter',
    uploadedAt: '2025-09-18T12:00:00Z',
  },
  {
    id: 'sample-3',
    title: 'Coastal Escape',
    description: 'A peaceful pier on a blue afternoon.',
    category: 'Travel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    uploader: 'Sarah Wilson',
    uploadedAt: '2025-08-05T17:15:00Z',
  },
  {
    id: 'sample-4',
    title: 'Serene Kayaks',
    description: 'Still waters and colorful kayaks.',
    category: 'Travel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    uploader: 'Michael Brown',
    uploadedAt: '2025-07-25T09:10:00Z',
  },
  {
    id: 'sample-5',
    title: 'City Lights',
    description: 'A quiet evening in the city.',
    category: 'Urban',
    thumbnailUrl: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800',
    photoUrl: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1600',
    uploader: 'Carson Lee',
    uploadedAt: '2025-06-15T19:45:00Z',
  },
  {
    id: 'sample-6',
    title: 'Forest Walk',
    description: 'Sun rays through the trees.',
    category: 'Nature',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80',
    uploader: 'Olivia Turner',
    uploadedAt: '2025-11-01T14:20:00Z',
  },
  {
    id: 'sample-7',
    title: 'Sunset Coastline',
    description: 'Warm colors on the shore.',
    category: 'Nature',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    uploader: 'Emily Robinson',
    uploadedAt: '2025-12-02T18:05:00Z',
  },
  {
    id: 'sample-8',
    title: 'Violet Bloom',
    description: 'Close-up of a spring flower.',
    category: 'Nature',
    thumbnailUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1600&q=80',
    uploader: 'David Miller',
    uploadedAt: '2025-05-10T08:50:00Z',
  },
  {
    id: 'sample-9',
    title: 'Misty Mountains',
    description: 'Clouds rolling over a dramatic mountain range.',
    category: 'Nature',
    thumbnailUrl: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800',
    photoUrl: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1600',
    uploader: 'Sophia Green',
    uploadedAt: '2025-04-12T06:35:00Z',
  },
  {
    id: 'sample-10',
    title: 'Golden Desert',
    description: 'Soft dunes glowing during golden hour.',
    category: 'Travel',
    thumbnailUrl: 'https://images.pexels.com/photos/248771/pexels-photo-248771.jpeg?auto=compress&cs=tinysrgb&w=800',
    photoUrl: 'https://images.pexels.com/photos/248771/pexels-photo-248771.jpeg?auto=compress&cs=tinysrgb&w=1600',
    uploader: 'Noah Adams',
    uploadedAt: '2025-03-08T17:10:00Z',
  },
  {
    id: 'sample-11',
    title: 'Calm Lake',
    description: 'Mirror reflections on a still alpine lake.',
    category: 'Nature',
    thumbnailUrl: 'https://images.pexels.com/photos/355423/pexels-photo-355423.jpeg?auto=compress&cs=tinysrgb&w=800',
    photoUrl: 'https://images.pexels.com/photos/355423/pexels-photo-355423.jpeg?auto=compress&cs=tinysrgb&w=1600',
    uploader: 'Ava Patel',
    uploadedAt: '2025-02-21T10:20:00Z',
  },
  {
    id: 'sample-12',
    title: 'Neon Street',
    description: 'A rainy urban street lit by neon signs.',
    category: 'Urban',
    thumbnailUrl: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
    photoUrl: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1600',
    uploader: 'Liam Foster',
    uploadedAt: '2025-01-14T21:40:00Z',
  },
];

const Categories = () => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  const fetchAllPhotos = async () => {
    try {
      const response = await axios.get(`${API_BASE}/photos`);
      // Merge backend photos with sample photos
      const mergedPhotos = Array.isArray(response.data) ? [...samplePhotos, ...response.data] : samplePhotos;
      setAllPhotos(mergedPhotos);
      setPhotos(mergedPhotos);
      
      // Extract unique categories
      const categories = [...new Set(mergedPhotos.map(p => p.category || 'General'))];
      setUniqueCategories(categories.sort());
    } catch (error) {
      console.error('Error fetching photos:', error);
      setAllPhotos(samplePhotos);
      setPhotos(samplePhotos);
      const categories = [...new Set(samplePhotos.map(p => p.category || 'General'))];
      setUniqueCategories(categories.sort());
    }
    setLoading(false);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    const filtered = allPhotos.filter(p => (p.category || 'General') === categoryName);
    setPhotos(filtered);
  };

  const handleShowAll = () => {
    setSelectedCategory(null);
    setPhotos(allPhotos);
  };

  return (
    <div className="categories-page">
      <style>{`
        .categories-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .categories-header {
          text-align: center;
          color: white;
          margin-bottom: 40px;
        }

        .categories-header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .filter-section {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
          align-items: center;
        }

        .filter-label {
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-btn {
          padding: 10px 20px;
          border: 2px solid #007bff;
          background: transparent;
          color: #007bff;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: bold;
        }

        .category-btn:hover,
        .category-btn.active {
          background: #007bff;
          color: white;
        }

        .show-all-btn {
          padding: 10px 20px;
          border: 2px solid #28a745;
          background: transparent;
          color: #28a745;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: bold;
        }

        .show-all-btn:hover {
          background: #28a745;
          color: white;
        }

        .gallery-section {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .photo-card {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }

        .photo-card:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(0, 123, 255, 0.5);
        }

        .photo-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .photo-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          color: white;
          padding: 15px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .photo-card:hover .photo-info {
          opacity: 1;
        }

        .photo-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .photo-uploader {
          font-size: 0.9em;
          color: #ccc;
        }

        .no-photos {
          text-align: center;
          color: white;
          grid-column: 1 / -1;
          padding: 40px;
        }
      `}</style>

      <div className="categories-header">
        <h1><FaFilter /> Photo Categories</h1>
        <p>Browse photos by category</p>
      </div>

      <SearchBar
        onSearchResults={(results) => {
          if (results && results.length > 0) {
            setSelectedCategory(null);
            setPhotos(results);
          } else {
            setPhotos(allPhotos);
          }
        }}
        allPhotos={allPhotos}
      />

      <div className="filter-section">
        <span className="filter-label"><FaFilter /> Filter By:</span>
        <button
          className={`show-all-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={handleShowAll}
        >
          All Photos
        </button>
        {uniqueCategories.map((categoryName) => (
          <button
            key={categoryName}
            className={`category-btn ${selectedCategory === categoryName ? 'active' : ''}`}
            onClick={() => handleCategoryClick(categoryName)}
          >
            {categoryName}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'white' }}>
          <p>Loading photos...</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="gallery-section">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.thumbnailUrl} alt={photo.title} />
              <div className="photo-info">
                <div className="photo-title">{photo.title}</div>
                <div className="photo-category" style={{ fontSize: '0.85em', color: '#90ee90', marginBottom: '5px' }}>
                  {photo.category || 'General'}
                </div>
                <div className="photo-uploader">By: {photo.uploader}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-photos">
          <p>No photos found in this category</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
