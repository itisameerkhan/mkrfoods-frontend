import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import "./CheckoutAddress.scss";

const CheckoutAddress = () => {
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false
    });

    useEffect(() => {
        // Redirect to login if user is not authenticated
        const auth = getAuth();
        if (!auth.currentUser && !user) {
            navigate("/checkout/auth");
        }
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddress(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmitAddress = (e) => {
        e.preventDefault();

        // Validate form
        if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
            alert("Please fill all fields");
            return;
        }

        // Store address in sessionStorage for checkout
        sessionStorage.setItem("checkoutAddress", JSON.stringify(address));

        // Redirect to payment/order review
        navigate("/checkout/review");
    };

    return (
        <div className="checkout-address">
            <div className="checkout-container">
                <h1>Delivery Address</h1>

                <form onSubmit={handleSubmitAddress} className="address-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={address.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={address.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            pattern="[0-9]{10}"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Street Address *</label>
                        <input
                            type="text"
                            id="street"
                            name="street"
                            value={address.street}
                            onChange={handleInputChange}
                            placeholder="Enter street address"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City *</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={address.city}
                                onChange={handleInputChange}
                                placeholder="Enter city"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State *</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={address.state}
                                onChange={handleInputChange}
                                placeholder="Enter state"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pincode">Pincode *</label>
                            <input
                                type="text"
                                id="pincode"
                                name="pincode"
                                value={address.pincode}
                                onChange={handleInputChange}
                                placeholder="Enter pincode"
                                pattern="[0-9]{6}"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group checkbox">
                        <input
                            type="checkbox"
                            id="isDefault"
                            name="isDefault"
                            checked={address.isDefault}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="isDefault">Set as default address</label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-continue">
                            Continue to Payment
                        </button>
                        <button type="button" className="btn-back" onClick={() => navigate("/cart")}>
                            Back to Cart
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutAddress;
