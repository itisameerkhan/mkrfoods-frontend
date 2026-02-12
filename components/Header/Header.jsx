import { useState } from "react";
import "./Header.scss";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";


const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  /* Icons mapping */
  const getIcon = (text) => {
    switch(text) {
      case "Pickles": return "fa-solid fa-jar"; 
      case "Snacks": return "fa-solid fa-cookie-bite";
      case "Sweets": return "fa-solid fa-ice-cream";
      case "Chillies": return "fa-solid fa-pepper-hot";
      case "My Orders": return "fa-solid fa-clipboard-list";
      case "Cart": return "fa-solid fa-cart-shopping";
      case "Profile": return "fa-solid fa-user";
      case "Home": return "fa-solid fa-house";
      default: return "fa-solid fa-utensils";
    }
  };

  const menuSections = [
    {
      title: "Menu",
      items: [
        { text: "Home", path: "/" },
        { text: "My Orders", path: "/my/orders" },
        { text: "Cart", path: "/cart" },
        { text: "Profile", path: "/profile" },
      ]
    },
    {
      title: "Categories",
      items: [
        { text: "Pickles", path: "/category/pickles" },
        { text: "Snacks", path: "/category/snacks" },
        { text: "Sweets", path: "/category/sweets" },
        { text: "Chillies", path: "/category/chillies" },
      ]
    }
  ];

  const list = () => (
    <Box
      sx={{ width: 320, backgroundColor: "#fff", height: "100%" }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <div className="custom-drawer-content">
        <div className="drawer-header-section">
          <p className="drawer-logo">MKR FOODS</p>
          <div className="close-btn">
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        
        <div className="drawer-menu-list">
          {menuSections.map((section, index) => (
            <div key={index} className="drawer-section">
              {section.title && <h3 className="section-title">{section.title}</h3>}
              {section.items.map((item) => (
                <div 
                  key={item.text} 
                  className="drawer-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <div className="icon-box">
                    <i className={getIcon(item.text)}></i>
                  </div>
                  <span className="menu-text">{item.text}</span>
                  <i className="fa-solid fa-arrow-right arrow-icon"></i>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="drawer-footer-section">
          <div className="social-links">
             <i className="fa-brands fa-instagram"></i>
             <i className="fa-brands fa-facebook"></i>
             <i className="fa-brands fa-twitter"></i>
          </div>
          <p>© 2026 MKR Foods</p>
        </div>
      </div>
    </Box>
  );


  return (
    <div className="header-container">
      <div className="header">
        {/* <div className="header-temp"></div> */}
        <div className="header-main">
          <div className="header-main-1">
            <div className="hamburger-menu" onClick={toggleDrawer(true)}>
              <i className="fa-solid fa-bars"></i>
            </div>
            <Link to={"/"}>
              <p>MKR Foods</p>
            </Link>
          </div>
          <div className="header-main-2">
            <NavLink to={"/cart"}>
              <i className="fa-solid fa-cart-shopping"></i>
            </NavLink>
            <NavLink to={"/profile"}>
              <i className="fa-solid fa-user"></i>
            </NavLink>
          </div>
        </div>
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
      </div>
    </div>
  );
};

export default Header;
