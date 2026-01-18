import React from 'react';
import './InstagramReels.scss';

const InstagramReels = () => {
  // Example Reel Embed URLs - User should replace these IDs with their own
  const reels = [
    {
      id: 1,
      // Using official Instagram/Creators reels as safe placeholders
      embedUrl: 'https://www.instagram.com/reel/DQTiShtiBgN/embed', 
      title: 'Reel 1'
    },
    {
      id: 2,
      embedUrl: 'https://www.instagram.com/reel/C3tA3-1Lx1-/embed',
      title: 'Reel 2'
    },
    {
      id: 3,
      embedUrl: 'https://www.instagram.com/reel/C3v8C4DrXz_/embed',
      title: 'Reel 3'
    }
  ];

  return (
    <div className="instagram-reels-section">
      <div className="content-container">
        <div className="text-content">
          <h2>Follow us on Instagram</h2>
          <p>
            Stay updated with our latest recipes, behind-the-scenes, and delicious moments. 
            Join our community @mkrfoods2025
          </p>
          <a 
            href="https://www.instagram.com/mkrfoods2025/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-follow"
          >
            Follow Us &rarr;
          </a>
        </div>

        <div className="reels-container">
          {reels.map((reel, index) => (
            <div 
              key={reel.id} 
              className={`reel-card card-${index + 1}`}
            >
              <div className="card-inner">
                <iframe 
                  src={reel.embedUrl} 
                  title={reel.title}
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowTransparency="true"
                  allow="encrypted-media"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstagramReels;
