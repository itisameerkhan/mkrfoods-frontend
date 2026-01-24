import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./index.scss";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addUser, removeUser } from "../config/userSlice";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ScrollToTop from "./utils/ScrollToTop";

import BackendStatus from "../components/BackendStatus/BackendStatus";

const App = () => {
  const dispatch = useDispatch();
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is logged in - store in Redux and localStorage
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };

        // Save to Redux
        dispatch(addUser(userData));

        // Save to localStorage for persistence
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // User is logged out - remove from Redux and localStorage
        dispatch(removeUser());
        localStorage.removeItem("user");
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [dispatch, auth]);

  useEffect(() => {
    if (user && location.pathname === "/account") {
      navigate("/profile");
    } else if (!user && location.pathname === "/profile") {
      navigate("/account");
    }
  }, [user, location, navigate]);

  return (
    <div className="app">
      <BackendStatus />
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;
