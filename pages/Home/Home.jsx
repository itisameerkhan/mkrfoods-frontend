import Hero from "../../components/Hero/Hero";
import AnnouncementBar from "../../components/AnnouncementBar/AnnouncementBar";
import HomeCategory from "../../components/HomeCategory/HomeCategory";
import LatestProducts from "../../components/LatestProducts/LatestProducts";
import Description from "../../components/Description/Description";
import Reviews from "../../components/Reviews/Reviews";
import InstagramReels from "../../components/InstagramReels/InstagramReels";
import Comparison from "../../components/Comparison/Comparison";

const Home = () => {
  return (
    <div className="home">
      <Hero />
      <AnnouncementBar />
      <HomeCategory />
      <LatestProducts />
      <Description />
      <Comparison />
      {/* <InstagramReels /> */}
      <Reviews />
      <AnnouncementBar />
    </div>
  );
};

export default Home;
