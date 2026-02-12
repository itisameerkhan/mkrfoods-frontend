import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    getDoc
} from "firebase/firestore";
import { db } from "../../config/firebase";
import "./CheckoutAddress.scss";
import { toast } from "react-toastify";
import CheckoutHeader from "../../components/CheckoutHeader/CheckoutHeader";
const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CheckoutAddress = () => {
    const user = useSelector(state => state.user);
    const cartItems = useSelector(state => state.cart.items);
    const navigate = useNavigate();
    
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userDocId, setUserDocId] = useState(null);
    const [deliveryChargesMap, setDeliveryChargesMap] = useState({});
    
    const [isDeliveryLoading, setIsDeliveryLoading] = useState(true);
    
    // New Address Form State matching UserProfile schema
    const [formData, setFormData] = useState({
        fullName: "",
        mobileNumber: "",
        flatHouseNo: "",
        areaStreet: "",
        landmark: "",
        townCity: "",
        state: "",
        pincode: "",
        country: "India",
        type: "HOME"
    });

    const [couponDiscount, setCouponDiscount] = useState(0);


    // --- Price Calculation ---
    const cartTotal = cartItems.reduce((sum, product) => {
        const productTotal = product.variants.reduce((variantSum, variant) =>
            variantSum + (variant.price * variant.quantity), 0);
        return sum + productTotal;
    }, 0);

    // Calculate Delivery Charge
    const getDeliveryCharge = () => {
        if (cartTotal > 1000) return 0;

        if (selectedAddressIndex === null || !savedAddresses[selectedAddressIndex]) return 0;
        
        const selectedAddress = savedAddresses[selectedAddressIndex];
        const stateKey = selectedAddress.state.replace(/\s+/g, ''); // Remove spaces to match Firestore keys
        
        if (deliveryChargesMap[stateKey]) {
            return Number(deliveryChargesMap[stateKey]);
        }
        
        return 100; // Default delivery charge if state not found
    };

    const deliveryCharge = getDeliveryCharge();
    const finalAmount = cartTotal + deliveryCharge - couponDiscount;

    // Load coupon from local storage
    useEffect(() => {
        const savedCoupon = localStorage.getItem("appliedCoupon");
        if (savedCoupon) {
            try {
                const coupon = JSON.parse(savedCoupon);
                if (cartTotal >= coupon.minimumOrder) {
                    setCouponDiscount(coupon.discount);
                } else {
                    // Coupon invalid due to cart update
                    if (couponDiscount !== 0) {
                        setCouponDiscount(0);
                        localStorage.removeItem("appliedCoupon");
                         toast.info(`Coupon removed: Order must be above ₹${coupon.minimumOrder}`);
                    }
                }
            } catch (error) {
                console.error("Error loading coupon:", error);
                setCouponDiscount(0);
            }
        } else {
            setCouponDiscount(0);
        }
    }, [cartTotal]);

    // --- Effects ---
    // Sync selection to session storage so header navigation works
    useEffect(() => {
        if (savedAddresses.length > 0 && selectedAddressIndex !== null && savedAddresses[selectedAddressIndex]) {
             const selectedAddress = savedAddresses[selectedAddressIndex];
             sessionStorage.setItem("checkoutAddress", JSON.stringify(selectedAddress));
             
             const pricingDetails = {
                cartTotal,
                couponDiscount,
                deliveryCharge,
                finalAmount
            };
            sessionStorage.setItem("checkoutPricing", JSON.stringify(pricingDetails));
        } else {
            // If no address selected or list empty, clear from session to block header nav
            sessionStorage.removeItem("checkoutAddress");
            sessionStorage.removeItem("checkoutPricing");
        }
    }, [selectedAddressIndex, savedAddresses, cartTotal, couponDiscount, finalAmount, deliveryCharge]);

    useEffect(() => {
        const auth = getAuth();
        if (!auth.currentUser && !user) {
            navigate("/account");
            return;
        }

        fetchAddresses();
        fetchDeliveryCharges();
    }, [user, navigate]);

    const fetchDeliveryCharges = async () => {
        setIsDeliveryLoading(true);
        try {
            const docRef = doc(db, "deliveryCharges", "amount");
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setDeliveryChargesMap(docSnap.data());
            } else {
                console.log("No delivery charges document found!");
            }
        } catch (error) {
            console.error("Error fetching delivery charges:", error);
        } finally {
            setIsDeliveryLoading(false);
        }
    };

    const fetchAddresses = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            // Fetch by email like UserProfile.jsx
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const data = docSnap.data();
                setUserDocId(docSnap.id); // Store Firestore ID

                const addresses = data.addresses || [];
                setSavedAddresses(addresses);
                
                // Select default
                if (data.defaultAddressId) {
                    const defaultIdx = addresses.findIndex(a => a.id === data.defaultAddressId);
                    if (defaultIdx !== -1) setSelectedAddressIndex(defaultIdx);
                } else if (addresses.length > 0) {
                     setSelectedAddressIndex(0);
                }
            } else {
                console.log("No user document found for email:", user.email);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({ ...prev, type }));
    };

    const handleAddNewAddress = () => {
        setFormData({
            fullName: user?.displayName || "",
            mobileNumber: "",
            flatHouseNo: "",
            areaStreet: "",
            landmark: "",
            townCity: "",
            state: "",
            pincode: "",
            country: "India",
            type: "HOME"
        });
        setShowAddForm(true);
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (!userDocId) {
            toast.error("User profile not found. Please contact support.");
            return;
        }

        // Validation
        if (!formData.fullName || !formData.mobileNumber || !formData.flatHouseNo || !formData.townCity || !formData.pincode) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const userRef = doc(db, "users", userDocId);
            const newAddress = { 
                ...formData, 
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };

            await updateDoc(userRef, {
                addresses: arrayUnion(newAddress)
            });

            toast.success("Address added successfully");
            setSavedAddresses(prev => [...prev, newAddress]);
            setSelectedAddressIndex(savedAddresses.length);
            setShowAddForm(false);
        } catch (error) {
            console.error("Error saving address:", error);
            toast.error("Failed to save address");
        }
    };

    const handleRemoveAddress = async (indexToRemove) => {
        if (!window.confirm("Are you sure you want to remove this address?")) return;
        if (!userDocId) return;

        try {
            const addressToRemove = savedAddresses[indexToRemove];
            const userRef = doc(db, "users", userDocId);
            
            await updateDoc(userRef, {
                addresses: arrayRemove(addressToRemove)
            });

            const newAddresses = savedAddresses.filter((_, i) => i !== indexToRemove);
            setSavedAddresses(newAddresses);
            if (selectedAddressIndex === indexToRemove) {
                setSelectedAddressIndex(newAddresses.length > 0 ? 0 : null);
            } else if (selectedAddressIndex > indexToRemove) {
                setSelectedAddressIndex(selectedAddressIndex - 1);
            }
            toast.success("Address removed");
        } catch (error) {
            console.error("Error removing address:", error);
            toast.error("Failed to remove address");
        }
    };

    const handleContinue = () => {
        if (selectedAddressIndex === null || !savedAddresses[selectedAddressIndex]) {
            toast.error("Please select a delivery address");
            return;
        }

        const selectedAddress = savedAddresses[selectedAddressIndex];
        sessionStorage.setItem("checkoutAddress", JSON.stringify(selectedAddress));
        
        // Save pricing details including coupon and delivery
        const pricingDetails = {
            cartTotal,
            couponDiscount,
            deliveryCharge,
            finalAmount
        };
        sessionStorage.setItem("checkoutPricing", JSON.stringify(pricingDetails));

        navigate("/checkout/payment");
    };

    return (
        <div className="checkout-address-page">
            <CheckoutHeader activeStep="address" />
            <div className="checkout-layout">
                {/* Left Column: Address Selection */}
                <div className="address-section">
                    <div className="section-header">
                        <h2>Select Delivery Address</h2>
                        <button className="btn-add-new" onClick={handleAddNewAddress}>
                            ADD NEW ADDRESS
                        </button>
                    </div>

                    {/* Always show address list */}
                    <div className="address-list">
                        {loading ? (
                             // Skeleton Loader
                            [1, 2, 3].map((i) => (
                                <div key={i} className="address-card skeleton">
                                    <div className="card-header">
                                        <div className="skeleton-circle"></div>
                                        <div className="skeleton-title"></div>
                                    </div>
                                    <div className="card-body">
                                        <div className="skeleton-line long"></div>
                                        <div className="skeleton-line medium"></div>
                                        <div className="skeleton-line short"></div>
                                    </div>
                                </div>
                            ))
                        ) : savedAddresses.length === 0 ? (
                            <p className="no-address">No saved addresses. Please add one.</p>
                        ) : (
                            savedAddresses.map((addr, index) => (
                                <div 
                                    key={index} 
                                    className={`address-card ${selectedAddressIndex === index ? 'selected' : ''}`}
                                    onClick={() => setSelectedAddressIndex(index)}
                                >
                                    <div className="card-header">
                                        <div className="radio-wrapper">
                                            <input 
                                                type="radio" 
                                                name="address" 
                                                checked={selectedAddressIndex === index} 
                                                onChange={() => setSelectedAddressIndex(index)}
                                            />
                                            <span className="name">{addr.fullName}</span>
                                            <span className="type-tag">{addr.type || "HOME"}</span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <p className="address-text">
                                            {addr.flatHouseNo}, {addr.areaStreet}
                                            <br />
                                            {addr.landmark ? `Near ${addr.landmark}, ` : ''}
                                            {addr.townCity}, {addr.state} - {addr.pincode}
                                        </p>
                                        <p className="mobile">Mobile: <strong>{addr.mobileNumber}</strong></p>
                                        
                                        {selectedAddressIndex === index && (
                                            <div className="card-actions">
                                                <button className="btn-remove" onClick={(e) => { e.stopPropagation(); handleRemoveAddress(index); }}>REMOVE</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Address Modal */}
                    {showAddForm && (
                        <div className="modal-overlay" onClick={handleCancelAdd}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Add New Address</h3>
                                    <button className="close-btn" onClick={handleCancelAdd}>&times;</button>
                                </div>
                                <form onSubmit={handleSaveAddress} className="new-address-form">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile Number *</label>
                                        <input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required pattern="[0-9]{10}" />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode *</label>
                                        <input name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Flat, House no., Building *</label>
                                        <input name="flatHouseNo" value={formData.flatHouseNo} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Area, Street, Sector *</label>
                                        <input name="areaStreet" value={formData.areaStreet} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Landmark</label>
                                        <input name="landmark" value={formData.landmark} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Town/City *</label>
                                        <input name="townCity" value={formData.townCity} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>State *</label>
                                        <select 
                                            name="state" 
                                            value={formData.state} 
                                            onChange={handleInputChange} 
                                            required
                                            className="state-select"
                                        >
                                            <option value="" disabled>Select State</option>
                                            {INDIAN_STATES.map((state) => (
                                                <option key={state} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group full-width type-selection">
                                        <label>Address Type</label>
                                        <div className="type-options">
                                            <button type="button" 
                                                className={formData.type === "HOME" ? "active" : ""} 
                                                onClick={() => handleTypeChange("HOME")}>HOME</button>
                                            <button type="button" 
                                                className={formData.type === "OFFICE" ? "active" : ""} 
                                                onClick={() => handleTypeChange("OFFICE")}>OFFICE</button>
                                             <button type="button" 
                                                className={formData.type === "HOTEL" ? "active" : ""} 
                                                onClick={() => handleTypeChange("HOTEL")}>HOTEL</button>
                                             <button type="button" 
                                                className={formData.type === "OTHER" ? "active" : ""} 
                                                onClick={() => handleTypeChange("OTHER")}>OTHER</button>
                                        </div>
                                    </div>

                                    <div className="form-actions-row">
                                        <button type="submit" className="btn-save">SAVE ADDRESS</button>
                                        <button type="button" className="btn-cancel" onClick={handleCancelAdd}>CANCEL</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="summary-section">

                    <div className="price-details-card">
                        <h4>PRICE DETAILS ({cartItems.reduce((acc, item) => acc + item.variants.reduce((vAcc, v) => vAcc + v.quantity, 0),0)} Items)</h4>
                        <div className="price-row">
                            <span>Total MRP</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>

                        {couponDiscount > 0 && (
                            <div className="price-row discount">
                                <span>Coupon Discount</span>
                                <span className="green">-₹{couponDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="price-row">
                            <span>Delivery Charges</span>
                            {isDeliveryLoading ? (
                                <span className="skeleton-price"></span>
                            ) : (
                                <span className={deliveryCharge === 0 ? "free" : ""}>
                                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                                </span>
                            )}
                        </div>
                        
                        <div className="price-divider"></div>
                        <div className="price-row total">
                            <span>Total Amount</span>
                            {isDeliveryLoading ? (
                                <span className="skeleton-price"></span>
                            ) : (
                                <span>₹{finalAmount.toFixed(2)}</span>
                            )}
                        </div>

                        <button 
                            className={`btn-continue-blob ${(!savedAddresses.length || selectedAddressIndex === null || isDeliveryLoading) ? 'disabled' : ''}`}
                            onClick={handleContinue}
                            disabled={!savedAddresses.length || selectedAddressIndex === null || isDeliveryLoading}
                            style={{ opacity: (!savedAddresses.length || selectedAddressIndex === null || isDeliveryLoading) ? 0.5 : 1, cursor: (!savedAddresses.length || selectedAddressIndex === null || isDeliveryLoading) ? 'not-allowed' : 'pointer' }}
                        >
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutAddress;
