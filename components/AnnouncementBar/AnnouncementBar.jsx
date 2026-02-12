import React from 'react';
import './AnnouncementBar.scss';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="marquee-content">
        <span>🚚 Free Delivery on orders above ₹1000! </span>
        <span>✨ Authentic Indian Flavors at your doorstep </span>
        <span>🚚 Free Delivery on orders above ₹1000! </span>
        <span>✨ Authentic Indian Flavors at your doorstep </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
