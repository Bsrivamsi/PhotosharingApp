import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
  WhatsappIcon,
} from 'react-share';
import { QRCodeCanvas } from 'qrcode.react';

function SharePanel({ photo, qrPhotoId, setQrPhotoId, placement = 'right' }) {
  const shareText = `Check out this photo: ${photo.title}`;
  
  return (
    <div className={`share-menu share-menu--${placement}`}>
      <div className="share-icons-row">
        <FacebookShareButton
          url={photo.photoUrl}
          quote={shareText}
          hashtag="#PhotoTribe"
          title="Share on Facebook"
        >
          <FacebookIcon size={28} round />
        </FacebookShareButton>
        <TwitterShareButton
          url={photo.photoUrl}
          title={`${photo.title} - shared on PhotoTribe`}
        >
          <TwitterIcon size={28} round />
        </TwitterShareButton>
        <LinkedinShareButton url={photo.photoUrl}>
          <LinkedinIcon size={28} round />
        </LinkedinShareButton>
        <EmailShareButton
          url={photo.photoUrl}
          subject={`Check out this photo on PhotoTribe: ${photo.title}`}
          body={photo.description}
        >
          <EmailIcon size={28} round />
        </EmailShareButton>
        <WhatsappShareButton
          url={photo.photoUrl}
          title={shareText}
          separator=" - "
        >
          <WhatsappIcon size={28} round />
        </WhatsappShareButton>
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
