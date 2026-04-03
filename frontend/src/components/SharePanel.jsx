import React from 'react';
import { FaEnvelope, FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { QRCodeCanvas } from 'qrcode.react';

function SharePanel({ photo, qrPhotoId, setQrPhotoId, placement = 'right' }) {
  const shareText = `Check out this photo: ${photo.title}`;
  const encodedUrl = encodeURIComponent(photo.photoUrl);
  const encodedShareText = encodeURIComponent(shareText);
  const encodedDescription = encodeURIComponent(photo.description || '');
  const emailSubject = encodeURIComponent(`Check out this photo on PhotoTribe: ${photo.title}`);

  const shareLinks = [
    {
      key: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Share on Facebook',
      icon: <FaFacebookF size={14} />,
      className: 'facebook-share'
    },
    {
      key: 'twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedShareText}`,
      label: 'Share on X',
      icon: <FaXTwitter size={14} />,
      className: 'twitter-share'
    },
    {
      key: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'Share on LinkedIn',
      icon: <FaLinkedinIn size={14} />,
      className: 'linkedin-share'
    },
    {
      key: 'email',
      href: `mailto:?subject=${emailSubject}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      label: 'Share by email',
      icon: <FaEnvelope size={14} />,
      className: 'email-share'
    },
    {
      key: 'whatsapp',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} - ${photo.photoUrl}`)}`,
      label: 'Share on WhatsApp',
      icon: <FaWhatsapp size={14} />,
      className: 'whatsapp-share'
    }
  ];
  
  return (
    <div className={`share-menu share-menu--${placement}`}>
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
  );
}

export default SharePanel;
