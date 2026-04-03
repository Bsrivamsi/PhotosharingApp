import React from 'react';
import { FaEnvelope, FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { QRCodeCanvas } from 'qrcode.react';

function SharePanel({ photo, qrPhotoId, setQrPhotoId, placement = 'right', buttonRect, onClose }) {
  const shareText = `Check out this photo: ${photo.title}`;
  const encodedUrl = encodeURIComponent(photo.photoUrl);
  const encodedShareText = encodeURIComponent(shareText);
  const encodedDescription = encodeURIComponent(photo.description || '');
  const emailSubject = encodeURIComponent(`Check out this photo on PhotoTribe: ${photo.title}`);

  const shareLinks = [
    { key: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: 'Share on Facebook', icon: <FaFacebookF size={18} />, className: 'facebook-share' },
    { key: 'twitter', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedShareText}`, label: 'Share on X', icon: <FaXTwitter size={18} />, className: 'twitter-share' },
    { key: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, label: 'Share on LinkedIn', icon: <FaLinkedinIn size={18} />, className: 'linkedin-share' },
    { key: 'email', href: `mailto:?subject=${emailSubject}&body=${encodedDescription}%0A%0A${encodedUrl}`, label: 'Share by email', icon: <FaEnvelope size={18} />, className: 'email-share' },
    { key: 'whatsapp', href: `https://wa.me/?text=${encodeURIComponent(`${shareText} - ${photo.photoUrl}`)}`, label: 'Share on WhatsApp', icon: <FaWhatsapp size={18} />, className: 'whatsapp-share' }
  ];

  // When rendered via portal, calculate fixed position from the button's bounding rect
  const getFixedStyle = () => {
    if (!buttonRect) return {};
    const base = { position: 'fixed', zIndex: 99999 };
    switch (placement) {
      case 'left':
        return { ...base, right: window.innerWidth - buttonRect.left + 8, top: buttonRect.top + buttonRect.height / 2, transform: 'translateY(-50%)' };
      case 'top':
        return { ...base, bottom: window.innerHeight - buttonRect.top + 8, left: buttonRect.left + buttonRect.width / 2, transform: 'translateX(-50%)' };
      default: // right
        return { ...base, left: buttonRect.right + 8, top: buttonRect.top + buttonRect.height / 2, transform: 'translateY(-50%)' };
    }
  };

  return (
    <>
      {/* Transparent backdrop — closes panel on outside click */}
      {onClose && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'transparent' }}
          onClick={onClose}
        />
      )}
      <div
        className={`share-menu share-menu--${placement}`}
        style={buttonRect ? getFixedStyle() : {}}
      >
        <div className="share-icons-row">
          {shareLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              title={link.label}
              className={`share-link-btn ${link.className}`}
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
          <button
            type="button"
            className="qr-toggle-btn"
            onClick={() => setQrPhotoId(qrPhotoId === photo.id ? null : photo.id)}
            title="Generate QR Code"
          >
            QR
          </button>
        </div>
        {qrPhotoId === photo.id && (
          <div className="qr-container">
            <QRCodeCanvas value={photo.photoUrl} size={100} />
          </div>
        )}
      </div>
    </>
  );
}

export default SharePanel;
