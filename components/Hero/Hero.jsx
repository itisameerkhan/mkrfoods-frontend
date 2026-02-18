import "./Hero.scss";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../../config/firebase";
import "./Hero.scss";

const Hero = () => {
  const [bannerData, setBannerData] = useState({
    bannerMobile: "https://res.cloudinary.com/dnyehgbeu/image/upload/v1770049133/mkrfoods/Gemini_Generated_Image_hhjqhchhjqhchhjq_tu4iyt.png",
    bannerPC: "https://res.cloudinary.com/dnyehgbeu/image/upload/v1768748388/mkrfoods/Gemini_Generated_Image_owid27owid27owid_na4giy.png",
    heading: (
      <>
        Taste of <span>Mother's Hands</span>
      </>
    ),
    description: "Made with love, just like Mom used to make. Pure, preservative-free, and full of nostalgia in every bite."
  });
  const [loading, setLoading] = useState(false); // Not blocking render with loading anymore

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const q = query(collection(db, "banner"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          console.log("Banner data fetched:", docData);
          
          setBannerData(prev => ({
            ...prev,
            ...docData
          }));
        } else {
          console.log("No banner document found in 'banner' collection.");
        }
      } catch (err) {
        console.error("Error fetching banner:", err);
      }
    };

    fetchBanner();
  }, []);



  return (
    <div className="hero">
      <div className="slide-content">
        <div className="bg-image">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet={bannerData.bannerMobile}
            />
            <img
              src={bannerData.bannerPC}
              alt={bannerData.heading || "Hero Background"}
            />
          </picture>
          <div className="overlay"></div>
        </div>
        <div className="hero-obj">
          <div className="hero-main">
            <p>
              {bannerData.heading}
            </p>
            <p>
              {bannerData.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
