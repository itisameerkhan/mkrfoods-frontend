import { Outlet } from "react-router-dom";
import "./index.scss";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const App = () => {
  return (
    <div className="app">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;
