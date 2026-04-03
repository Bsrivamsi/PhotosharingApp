import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaShare } from 'react-icons/fa';
import { API_BASE } from '../api';
import LikeButton from '../components/LikeButton';
import CommentsSection from '../components/CommentsSection';
import FollowButton from '../components/FollowButton';

const SharePanel = lazy(() => import('../components/SharePanel'));

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

function Gallery({ token, username }) {
  const [photos, setPhotos] = useState(samplePhotos);
  const [allPhotos, setAllPhotos] = useState(samplePhotos);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', file: null });
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [photoMeta, setPhotoMeta] = useState({
    orientation: '',
    format: 'photo',
    mood: 'balanced',
    palette: 'neutral tones',
    contrast: 'medium contrast',
    texture: 'clean details',
    sceneHint: 'editorial vibe',
    seed: 0,
  });
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('');
  const [visibleRows, setVisibleRows] = useState(2);
  const [cardsPerRow, setCardsPerRow] = useState(1);
  const [shareMenuId, setShareMenuId] = useState(null);
  const [shareMenuPlacement, setShareMenuPlacement] = useState({});
  const [qrPhotoId, setQrPhotoId] = useState(null);
  const [editFilters, setEditFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
  });
  const cardGridRef = useRef(null);
  const scrollTrackRef = useRef(null);

  const buildAutoDescription = (title, meta, hasPhoto) => {
    const normalizedTitle = (title || '').trim() || 'Untitled photo';
    const formatText = meta?.format ? meta.format.toLowerCase() : 'photo';
    const orientationText = meta?.orientation || 'balanced';
    const moodText = meta?.mood || 'balanced';
    const paletteText = meta?.palette || 'neutral tones';
    const contrastText = meta?.contrast || 'medium contrast';
    const textureText = meta?.texture || 'clean details';
    const sceneHint = meta?.sceneHint || 'editorial vibe';
    const templateSet = [
      `${normalizedTitle} frames a ${orientationText} ${formatText} with ${moodText}, ${paletteText}, and ${textureText}.`,
      `${normalizedTitle} captures a ${sceneHint} in a ${orientationText} composition, blending ${paletteText} with ${contrastText}.`,
      `In ${normalizedTitle}, the ${formatText} treatment leans ${moodText}, with ${textureText} and ${paletteText}.`,
      `${normalizedTitle} presents a ${orientationText} visual story with ${contrastText}, ${moodText}, and a ${paletteText} palette.`,
      `${normalizedTitle} delivers a ${sceneHint} feel through ${textureText}, ${contrastText}, and ${paletteText}.`,
    ];
    const templateIndex = Math.abs(meta?.seed || 0) % templateSet.length;
    const oneLine = hasPhoto
      ? templateSet[templateIndex]
      : `${normalizedTitle} - add a photo to generate an AI-style one-line description.`;
    return oneLine.slice(0, 140);
  };

  const getAutoCategory = (title, description) => {
    const searchable = `${title || ''} ${description || ''}`.toLowerCase();

    if (/(mountain|forest|lake|beach|coast|ocean|river|sunset|sunrise|nature|landscape|tree|sky|flower)/.test(searchable)) {
      return 'Nature';
    }
    if (/(city|urban|street|building|road|night|neon|downtown)/.test(searchable)) {
      return 'Urban';
    }
    if (/(portrait|person|people|selfie|face|model|wedding)/.test(searchable)) {
      return 'People';
    }
    if (/(animal|wildlife|bird|cat|dog|pet|zoo)/.test(searchable)) {
      return 'Wildlife';
    }
    if (/(food|drink|coffee|restaurant|meal|dessert)/.test(searchable)) {
      return 'Food';
    }
    if (/(travel|trip|vacation|journey|adventure|kayak|pier|desert)/.test(searchable)) {
      return 'Travel';
    }

    return 'General';
  };

  const previewCategory = form.category.trim() || getAutoCategory(form.title, form.description);

  const fetchPhotos = async () => {
    const response = await fetch(`${API_BASE}/photos`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const mergedPhotos = [...samplePhotos, ...data];
      setPhotos(mergedPhotos);
      setAllPhotos(mergedPhotos);
    } else {
      setPhotos(samplePhotos);
      setAllPhotos(samplePhotos);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (!form.file) {
      setSelectedPreviewUrl('');
      setPhotoMeta({
        orientation: '',
        format: 'photo',
        mood: 'balanced',
        palette: 'neutral tones',
        contrast: 'medium contrast',
        texture: 'clean details',
        sceneHint: 'editorial vibe',
        seed: 0,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(form.file);
    setSelectedPreviewUrl(objectUrl);

    const mimeSubtype = (form.file.type || '').split('/')[1] || 'photo';
    const normalizedFormat = mimeSubtype.toLowerCase();
    const mappedFormat = normalizedFormat === 'jpeg' ? 'JPG' : normalizedFormat.toUpperCase();
    setPhotoMeta((prev) => ({ ...prev, format: mappedFormat }));

    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / Math.max(img.naturalHeight, 1);
      const orientation = ratio > 1.15 ? 'landscape' : ratio < 0.85 ? 'portrait' : 'square';

      // Analyze image pixels on a tiny canvas to generate distinct suggestions per photo.
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setPhotoMeta((prev) => ({ ...prev, orientation }));
        return;
      }

      const sampleSize = 48;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let totalLuma = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalR += r;
        totalG += g;
        totalB += b;
        totalLuma += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      const pixelCount = data.length / 4;
      const avgR = totalR / pixelCount;
      const avgG = totalG / pixelCount;
      const avgB = totalB / pixelCount;
      const avgLuma = totalLuma / pixelCount;

      const maxChannel = Math.max(avgR, avgG, avgB);
      const minChannel = Math.min(avgR, avgG, avgB);
      const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;

      let mood = 'balanced';
      if (avgLuma > 165 && saturation > 0.22) {
        mood = 'bright and lively';
      } else if (avgLuma > 145) {
        mood = 'soft and airy';
      } else if (avgLuma < 95 && saturation > 0.2) {
        mood = 'dramatic and intense';
      } else if (avgLuma < 95) {
        mood = 'moody and cinematic';
      } else if (saturation < 0.14) {
        mood = 'calm and minimal';
      }

      let palette = 'neutral tones';
      if (avgR > avgG * 1.15 && avgR > avgB * 1.2) {
        palette = 'warm amber tones';
      } else if (avgG > avgR * 1.1 && avgG > avgB * 1.1) {
        palette = 'lush green tones';
      } else if (avgB > avgR * 1.1 && avgB > avgG * 1.08) {
        palette = 'cool blue tones';
      } else if (Math.abs(avgR - avgG) < 14 && avgB < avgR * 0.85) {
        palette = 'earthy golden tones';
      }

      const contrastRange = maxChannel - minChannel;
      let contrast = 'medium contrast';
      if (contrastRange > 92) {
        contrast = 'high contrast';
      } else if (contrastRange < 45) {
        contrast = 'low contrast';
      }

      let texture = 'clean details';
      if (saturation > 0.3 && contrastRange > 85) {
        texture = 'rich textures';
      } else if (avgLuma < 100 && saturation < 0.16) {
        texture = 'soft grain-like texture';
      } else if (saturation < 0.12) {
        texture = 'subtle tonal texture';
      }

      let sceneHint = 'editorial vibe';
      if (palette === 'lush green tones') {
        sceneHint = 'nature-forward atmosphere';
      } else if (palette === 'cool blue tones') {
        sceneHint = 'coastal or sky-driven mood';
      } else if (palette === 'warm amber tones') {
        sceneHint = 'golden-hour atmosphere';
      } else if (palette === 'earthy golden tones') {
        sceneHint = 'landscape documentary feel';
      }

      // Derive a stable per-image seed from visual metrics to vary sentence templates.
      const seed = Math.round((avgR * 3 + avgG * 5 + avgB * 7 + avgLuma * 11 + contrastRange * 13) % 997);

      setPhotoMeta((prev) => ({
        ...prev,
        orientation,
        mood,
        palette,
        contrast,
        texture,
        sceneHint,
        seed,
      }));
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
      img.onload = null;
    };
  }, [form.file]);

  useEffect(() => {
    if (descriptionEdited) {
      return;
    }

    const nextDescription = buildAutoDescription(form.title, photoMeta, Boolean(form.file));
    setForm((prev) => {
      if (prev.description === nextDescription) {
        return prev;
      }
      return { ...prev, description: nextDescription };
    });
  }, [descriptionEdited, form.file, form.title, photoMeta]);

  useEffect(() => {
    const updateCardsPerRow = () => {
      if (!cardGridRef.current) {
        return;
      }

      const templateColumns = window.getComputedStyle(cardGridRef.current).gridTemplateColumns;
      const count = templateColumns.split(' ').filter(Boolean).length;
      setCardsPerRow(Math.max(1, count));
    };

    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);

    return () => {
      window.removeEventListener('resize', updateCardsPerRow);
    };
  }, []);

  const getUploadTime = (photo) => {
    if (!photo?.uploadedAt) {
      return 0;
    }

    const parsed = Date.parse(photo.uploadedAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const sortedPhotos = [...photos].sort((a, b) => getUploadTime(b) - getUploadTime(a));

  useEffect(() => {
    if (!scrollTrackRef.current || sortedPhotos.length < 2) {
      return;
    }

    const track = scrollTrackRef.current;
    let animationFrameId;
    let paused = false;

    const step = () => {
      if (!paused) {
        track.scrollLeft += 0.6;
        const loopPoint = track.scrollWidth / 2;
        if (track.scrollLeft >= loopPoint) {
          track.scrollLeft = 0;
        }
      }
      animationFrameId = window.requestAnimationFrame(step);
    };

    const onMouseEnter = () => {
      paused = true;
    };

    const onMouseLeave = () => {
      paused = false;
    };

    track.addEventListener('mouseenter', onMouseEnter);
    track.addEventListener('mouseleave', onMouseLeave);
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      track.removeEventListener('mouseenter', onMouseEnter);
      track.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [sortedPhotos.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.file) {
      setMessage('Please select a photo file to upload');
      return;
    }

    const payload = new FormData();
    payload.append('file', form.file);
    payload.append('title', form.title);
    payload.append('description', form.description);
    if (form.category.trim()) {
      payload.append('category', form.category.trim());
    }

    setUploading(true);
    const response = await fetch(`${API_BASE}/photos/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });
    setUploading(false);

    if (!response.ok) {
      const error = await response.text();
      setMessage(error || 'Upload failed');
      return;
    }

    setMessage('Uploaded successfully!');
    setForm({ title: '', description: '', category: '', file: null });
    setDescriptionEdited(false);
    setPhotoMeta({
      orientation: '',
      format: 'photo',
      mood: 'balanced',
      palette: 'neutral tones',
      contrast: 'medium contrast',
      texture: 'clean details',
      sceneHint: 'editorial vibe',
      seed: 0,
    });
    setSelectedPreviewUrl('');
    fetchPhotos();
  };

  const handleDownload = async (photoId, title, photoUrl) => {
    try {
      if (token) {
        await fetch(`${API_BASE}/photos/${photoId}/download`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch(`${API_BASE}/photos/${photoId}/download`, { method: 'POST' });
      }
    } catch (error) {
      console.error('Error recording download:', error);
    }
    const downloadUrl = photoUrl || '';
    if (!downloadUrl) return;
    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback for cross-origin images that block fetch: open in new tab
      window.open(downloadUrl, '_blank');
    }
  };

  const handleShare = async (photoId) => {
    try {
      if (token) {
        await fetch(`${API_BASE}/photos/${photoId}/share`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch(`${API_BASE}/photos/${photoId}/share`, { method: 'POST' });
      }
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  const getShareMenuPlacement = (buttonEl) => {
    if (!buttonEl || typeof window === 'undefined') {
      return 'right';
    }

    const rect = buttonEl.getBoundingClientRect();
    const estimatedMenuWidth = 300;
    const estimatedMenuHeight = 220;
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;

    if (spaceRight >= estimatedMenuWidth) {
      return 'right';
    }

    if (spaceLeft >= estimatedMenuWidth) {
      return 'left';
    }

    if (spaceTop >= estimatedMenuHeight) {
      return 'top';
    }

    return 'top';
  };

  const previewPhotos = sortedPhotos.slice(0, 10);
  const displayedCount = Math.min(sortedPhotos.length, visibleRows * cardsPerRow);
  const displayedPhotos = sortedPhotos.slice(0, displayedCount);
  const hasMorePhotos = displayedCount < sortedPhotos.length;
  const autoScrollPhotos = sortedPhotos.length > 0 ? [...sortedPhotos, ...sortedPhotos] : [];
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'A');
  const getShortName = (name) => (name ? name.split(' ')[0] : 'Anonymous');

  return (
    <div className="panel">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">PhotoTribe</span>
          <h1>Discover & share amazing photos</h1>
          <p>Explore the latest uploads or log in to upload your own creative shots. Everyone can browse the gallery instantly.</p>
        </div>
      </section>

      <section className="gallery-preview">
        <div className="preview-grid">
          {previewPhotos.map((photo) => (
            <article className="preview-card" key={photo.id}>
              <img src={photo.thumbnailUrl} alt={photo.title} />
              <div className="preview-meta">
                <div className="preview-avatar">{getInitial(photo.uploader)}</div>
                <div>
                  <p className="preview-name">{getShortName(photo.uploader)}</p>
                  <p className="preview-date">{photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <a className="cta-button" href="#full-gallery">See All Photos</a>
      </section>

      <section className="community-panel">
        <div className="community-copy">
          <h2>Join the community</h2>
          <p>Create an account to share your photos and engage with others.</p>
        </div>
        <Link className="secondary-button" to="/register">Register</Link>
      </section>

      <section id="full-gallery" className="form-panel">
        <h2>Photo Gallery</h2>
        <p>Browse the public thumbnails and share your own images.</p>
        {message && <div className="alert">{message}</div>}

        {token ? (
          <form onSubmit={handleSubmit}>
            {selectedPreviewUrl && (
              <section className="upload-preview" aria-live="polite">
                <p className="upload-preview-label">Auto thumbnail preview</p>
                <article className="upload-preview-card">
                  <img
                    src={selectedPreviewUrl}
                    alt="Selected upload preview"
                    style={{
                      filter: `brightness(${editFilters.brightness}%) contrast(${editFilters.contrast}%) saturate(${editFilters.saturate}%)`,
                    }}
                  />
                  <div className="upload-preview-meta">
                    <h3>{form.title || 'Untitled photo'}</h3>
                    <p>{form.description || 'Add a description to help others understand your photo.'}</p>
                    <div className="upload-preview-category-row">
                      <span className="photo-category-badge">{previewCategory}</span>
                      <small>{form.category.trim() ? 'Manual category' : 'Auto category preview'}</small>
                    </div>
                    <span>{username || 'You'} • {new Date().toLocaleDateString()}</span>
                    <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                      <label>
                        Brightness: {editFilters.brightness}%
                        <input
                          type="range"
                          min="60"
                          max="140"
                          value={editFilters.brightness}
                          onChange={(e) => setEditFilters((prev) => ({ ...prev, brightness: Number(e.target.value) }))}
                        />
                      </label>
                      <label>
                        Contrast: {editFilters.contrast}%
                        <input
                          type="range"
                          min="60"
                          max="160"
                          value={editFilters.contrast}
                          onChange={(e) => setEditFilters((prev) => ({ ...prev, contrast: Number(e.target.value) }))}
                        />
                      </label>
                      <label>
                        Saturation: {editFilters.saturate}%
                        <input
                          type="range"
                          min="60"
                          max="160"
                          value={editFilters.saturate}
                          onChange={(e) => setEditFilters((prev) => ({ ...prev, saturate: Number(e.target.value) }))}
                        />
                      </label>
                    </div>
                  </div>
                </article>
              </section>
            )}

            <div className="form-group">
              <label>Photo title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter a title"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => {
                  setDescriptionEdited(true);
                  setForm({ ...form, description: e.target.value });
                }}
                placeholder="Add a short description"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Enter a category or leave blank for auto category"
              />
              <small className="form-hint">If you leave this empty, the app will create an automatic category for the photo and show it on the Categories page and photo cards.</small>
            </div>
            <div className="form-group">
              <label>Photo file</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.jfif,.jfi,.png,.gif,.bmp,.webp,.svg,.ico,.tiff,.heic,.avif"
                onChange={(e) => {
                  const nextFile = e.target.files?.[0] || null;
                  setDescriptionEdited(false);
                  setForm((prev) => ({ ...prev, file: nextFile }));
                }}
                required
              />
            </div>
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </form>
        ) : (
          <div className="alert">Anyone can view the gallery; login to upload your own photos.</div>
        )}

        <div className="all-photos-scroll-panel" aria-label="See all photos scroller">
          <div className="all-photos-scroll-track" ref={scrollTrackRef}>
            {autoScrollPhotos.map((photo, index) => (
              <article className="all-photos-scroll-card" key={`scroll-${photo.id}-${index}`}>
                <img src={photo.thumbnailUrl} alt={photo.title} />
                <div className="all-photos-scroll-content">
                  <h3>{photo.title}</h3>
                  <span className="photo-category-badge compact">{photo.category || 'General'}</span>
                  <p>{photo.uploader || 'Anonymous'}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`photo-cards-section${hasMorePhotos ? ' has-more' : ''}`}>
        <div className="card-grid" ref={cardGridRef}>
          {sortedPhotos.length === 0 ? (
            <div className="alert">No photos are available yet. Check back soon!</div>
          ) : (
            displayedPhotos.map((photo) => (
              (() => {
                const isDemoPhoto = String(photo.id).startsWith('sample-');
                return (
              <article className="photo-card" key={photo.id}>
                <img src={photo.thumbnailUrl} alt={photo.title} data-photo-url={photo.id} />
                <div className="card-body">
                  <span className="photo-category-badge">{photo.category || 'General'}</span>
                  <h3>{photo.title}</h3>
                  <p>{photo.description || 'No description provided.'}</p>
                  <div className="metadata">
                    <span>{photo.uploader || 'Anonymous'}</span>
                    <span>{photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="card-actions">
                    <a href={photo.photoUrl} target="_blank" rel="noreferrer">View full image</a>
                    <button onClick={() => handleDownload(photo.id, photo.title, photo.photoUrl)} className="action-btn download-btn" title="Download photo">
                      <FaDownload /> Download
                    </button>
                  </div>
                  <div className="card-engagement-row">
                    <div className="share-button-wrapper">
                      <button 
                        onClick={(event) => {
                          if (!isDemoPhoto) {
                            handleShare(photo.id);
                          }
                          const nextMenuId = shareMenuId === photo.id ? null : photo.id;
                          if (nextMenuId) {
                            const placement = getShareMenuPlacement(event.currentTarget);
                            setShareMenuPlacement((prev) => ({ ...prev, [photo.id]: placement }));
                          }
                          setShareMenuId(nextMenuId);
                        }} 
                        className="engagement-btn share-btn icon-only" 
                        title="Share photo"
                      >
                        <FaShare />
                      </button>
                      {shareMenuId === photo.id && (
                        <Suspense fallback={<div className="share-menu" style={{minWidth: 'auto', padding: '0.5rem'}}>Loading...</div>}>
                          <SharePanel
                            photo={photo}
                            qrPhotoId={qrPhotoId}
                            setQrPhotoId={setQrPhotoId}
                            placement={shareMenuPlacement[photo.id] || 'right'}
                          />
                        </Suspense>
                      )}
                    </div>
                    <FollowButton targetUsername={photo.uploader} token={token} currentUsername={username} isDemo={isDemoPhoto} />
                    <LikeButton photoId={photo.id} token={token} username={username} isDemo={isDemoPhoto} />
                    <CommentsSection photoId={photo.id} token={token} username={username} compact={true} isDemo={isDemoPhoto} />
                  </div>
                </div>
              </article>
                );
              })()
            ))
          )}
        </div>

        {hasMorePhotos && (
          <div className="photo-cards-next-wrap">
            <button
              type="button"
              className="photo-cards-next"
              onClick={() => setVisibleRows((prev) => prev + 1)}
              aria-label="Show more photos"
            >
              <span className="photo-cards-next-text">See more</span>
              <span className="photo-cards-next-icon">&gt;</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Gallery;
