import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./Hero.scss";

const slides = [
  {
    image:
      "https://res.cloudinary.com/dnyehgbeu/image/upload/v1768748388/mkrfoods/Gemini_Generated_Image_owid27owid27owid_na4giy.png",
    title: (
      <>
        Taste of <span>Mother's Hands</span>
      </>
    ),
    description:
      "Made with love, just like Mom used to make. Pure, preservative-free, and full of nostalgia in every bite.",
  },
  {
    image:
      "https://res.cloudinary.com/dab6haofi/image/upload/v1765523971/hero1_mdt6fq.jpg",
    title: (
      <>
        Authentic Indian <span>Pickles</span>, <span>Snacks</span> &{" "}
        <span>Sweets</span>
      </>
    ),
    description:
      "From crunchy snacks to spicy pickles, explore our wide range of traditional delights delivered straight to your doorstep.",
  },
  {
    image:
      "https://res.cloudinary.com/dnyehgbeu/image/upload/v1768749285/mkrfoods/Gemini_Generated_Image_lw1yk8lw1yk8lw1y_vl32e1.png",
    title: (
      <>
        Celebrate with <span>Authentic Flavors</span>
      </>
    ),
    description:
      "Perfect companions for your festivals and family gatherings. Share the joy of traditional Indian tastes with your loved ones.",
  },
];

const Hero = () => {
  return (
    <div className="hero">
      <Splide
        options={{
          type: "loop",
          perPage: 1,
          autoplay: true,
          interval: 2500,
          arrows: false,
          pagination: false,
          pauseOnHover: false,
          speed: 250,
          easing: "ease",
        }}
        aria-label="Hero Images"
      >
        {slides.map((slide, index) => (
          <SplideSlide key={index}>
            <div className="slide-content">
              <div className="bg-image">
                <img src={slide.image} alt={`Slide ${index + 1}`} />
                <div className="overlay"></div>
              </div>
              <div className="hero-obj">
                <div className="hero-main">
                  <p>{slide.title}</p>
                  <p>{slide.description}</p>

                </div>
              </div>
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

export default Hero;
