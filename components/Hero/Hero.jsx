import "./Hero.scss";

const Hero = () => {
  return (
    <div className="hero">
      <div className="slide-content">
        <div className="bg-image">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet="https://res.cloudinary.com/dnyehgbeu/image/upload/v1770049133/mkrfoods/Gemini_Generated_Image_hhjqhchhjqhchhjq_tu4iyt.png"
            />
            <img
              src="https://res.cloudinary.com/dnyehgbeu/image/upload/v1768748388/mkrfoods/Gemini_Generated_Image_owid27owid27owid_na4giy.png"
              alt="Hero Background"
            />
          </picture>
          <div className="overlay"></div>
        </div>
        <div className="hero-obj">
          <div className="hero-main">
            <p>
              Taste of <span>Mother's Hands</span>
            </p>
            <p>
              Made with love, just like Mom used to make. Pure, preservative-free, and full of nostalgia in every bite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
