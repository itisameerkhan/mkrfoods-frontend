import "./Hero.scss";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-bg">
        <img
          src="https://res.cloudinary.com/dab6haofi/image/upload/v1765523971/hero1_mdt6fq.jpg"
          alt="img"
        />
      </div>
      <div className="hero-obj">
        <div className="hero-main">
          <p>
            Authentic Indian <span>Pickles</span>, <span>Snacks</span> &{" "}
            <span>Sweets</span>
          </p>
          <p>
            Handcrafted flavours from MKR Foods - bringing the taste of
            traditional Indian kitchens to your home with love and care.
          </p>
          <div className="hero-btn">
            <button>Shop Now</button>
            <button>Explore Products</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
