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

  const menuItems = [
    { text: "Pickles", path: "/category/pickles" },
    { text: "Snacks", path: "/category/snacks" },
    { text: "Sweets", path: "/category/sweets" },
    { text: "Chillies", path: "/category/chillies" },
  ];

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <div className="drawer-header">
        <h2>Menu</h2>
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
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
  );
};

export default Header;
