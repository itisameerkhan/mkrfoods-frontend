import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Checkout.scss";

const CheckoutLayout = ({ children }) => {
    const user = useSelector(state => state.user.user);
    const navigate = useNavigate();

    useEffect(() => {
        // This component handles the checkout flow
        // If user is not logged in, they'll be shown the auth page
        // If user is logged in, they'll proceed to the address page
    }, [user, navigate]);

    return (
        <div className="checkout">
            <div className="checkout-container">
                {children}
            </div>
        </div>
    );
};

export default CheckoutLayout;
