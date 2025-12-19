import "./HomeCategory.scss";
import { Link } from "react-router-dom";

const HomeCategory = () => {
  return (
    <div className="homecategory">
      <div className="hc-top">
        <p className="hcp1">
          Shop By <span>Category</span>
        </p>
        <p className="hcp2">
          Explore our wide range of authentic Indian delicacies
        </p>
      </div>
      <div className="hc-main">
        <Link to={"/category/pickles"}>
          <img
            src="https://res.cloudinary.com/dnyehgbeu/image/upload/v1759820332/mkrfoods/pickles_7_zgitxx.png"
            alt="img"
          />
        </Link>
        <Link to={"/category/sweets"}>
          <img
            src="https://res.cloudinary.com/dnyehgbeu/image/upload/v1759820333/mkrfoods/pickles_8_eegray.png"
            alt="img"
          />
        </Link>
        <Link to={"/category/snacks"}>
          <img
            src="https://res.cloudinary.com/dnyehgbeu/image/upload/v1759820332/mkrfoods/pickles_6_nv102j.png"
            alt="img"
          />
        </Link>
        <Link to={"/category/chillies"}>
          <img
            src="https://res.cloudinary.com/dnyehgbeu/image/upload/v1759820331/mkrfoods/pickles_9_bvrue8.png"
            alt="img"
          />
        </Link>
      </div>
    </div>
  );
};

export default HomeCategory;
