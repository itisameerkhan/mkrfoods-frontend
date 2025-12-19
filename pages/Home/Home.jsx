import React from "react";
import Hero from "../../components/Hero/Hero";
import HomeCategory from "../../components/HomeCategory/HomeCategory";
import LatestProducts from "../../components/LatestProducts/LatestProducts";
import Description from "../../components/Description/Description";
import Reviews from "../../components/Reviews/Reviews";

const Home = () => {
  return (
    <div className="home">
      <Hero />
      <HomeCategory />
      <LatestProducts />
      <Description />
      <Reviews />
    </div>
  );
};

export default Home;
