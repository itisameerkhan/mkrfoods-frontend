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
        <Link to={"/category/pickles"} className="cat-item">
          <img
            src="https://ik.imagekit.io/itisameerkhan/Gemini_Generated_Image_yfigauyfigauyfig_qlbfrz.png?updatedAt=1772546391389"
            alt="Pickles"
          />
          <p className="cat-label">PICKLES</p>
        </Link>
        <Link to={"/category/sweets"} className="cat-item">
          <img
            src="https://ik.imagekit.io/itisameerkhan/Gemini_Generated_Image_t0v7npt0v7npt0v7_wbrp88.png?updatedAt=1772546391942"
            alt="Sweets"
          />
          <p className="cat-label">SWEETS</p>
        </Link>
        <Link to={"/category/snacks"} className="cat-item">
          <img
            src="https://ik.imagekit.io/itisameerkhan/Gemini_Generated_Image_tv12kktv12kktv12_xlvx2c.png?updatedAt=1772546393097"
            alt="Snacks"
          />
          <p className="cat-label">SNACKS</p>
        </Link>
        <Link to={"/category/chillies"} className="cat-item">
          <img
            src="https://ik.imagekit.io/itisameerkhan/Gemini_Generated_Image_snfs7isnfs7isnfs_ygxzmn.png?updatedAt=1772546389068"
            alt="Chillies"
          />
          <p className="cat-label">CHILLIES</p>
        </Link>
      </div>
    </div>
  );
};

export default HomeCategory;
