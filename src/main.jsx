import { createRoot } from "react-dom/client";
import "./index.scss";
import "./toastStyles.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Account from "../pages/Account/Account.jsx";
import Product from "../pages/Product/Product.jsx";
import UserProfile from "../pages/UserProfile/UserProfile.jsx";
import { Provider } from "react-redux";
import appStore from "../config/appStore.js";
import Category from "../pages/Category/Category.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadCartFromStorage } from "../config/cartSlice";
import CheckoutAuth from "../pages/Checkout/CheckoutAuth.jsx";
import CheckoutAddress from "../pages/Checkout/CheckoutAddress.jsx";
import OtpVerification from "../pages/OtpVerification/OtpVerification.jsx";

// Load cart from localStorage and initialize Redux
const initialCart = loadCartFromStorage();
appStore.dispatch({ type: "cart/initializeCartFromStorage", payload: initialCart });

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/profile",
        element: <UserProfile />,
      },
      {
        path: "/account",
        element: <Account />,
      },
      {
        path: "/otp-verification",
        element: <OtpVerification />,
      },
      {
        path: "/product/:id",
        element: <Product />,
      },
      {
        path: "/category/:category",
        element: <Category />,
      },
      {
        path: "/checkout/auth",
        element: <CheckoutAuth />,
      },
      {
        path: "/checkout/address",
        element: <CheckoutAddress />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={appStore}>
    <RouterProvider router={appRouter} />
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </Provider>
);
