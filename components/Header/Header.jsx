import "./Header.scss";
import { Link, NavLink } from "react-router-dom";

const Header = () => {
  return (
    <div className="header">
      {/* <div className="header-temp"></div> */}
      <div className="header-main">
        <div className="header-main-1">
          <Link to={"/"}>
            <p>MKR Foods</p>
          </Link>
        </div>
        <div className="header-main-2">
          <NavLink to={"/cart"}>
            <i class="fa-solid fa-cart-shopping"></i>
          </NavLink>
          <NavLink to={"/profile"}>
            <i class="fa-solid fa-user"></i>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Header;
