import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import validator from "validator";
import "./UserProfile.scss";
import { useSelector } from "react-redux";
import MyOrders from "../MyOrders/MyOrders";

const UserProfile = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("profile");

  const user = useSelector((store) => store.user);
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [userDocId, setUserDocId] = useState(null);

  // Address States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    country: "India",
    fullName: "",
    mobileNumber: "",
    pincode: "",
    flatHouseNo: "",
    areaStreet: "",
    landmark: "",
    townCity: "",
    state: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming email is unique, there should be only one document
            const userData = querySnapshot.docs[0].data();
            setFirestoreUser(userData);
            setUserDocId(querySnapshot.docs[0].id);

            // Fetch addresses
            if (userData.addresses && Array.isArray(userData.addresses)) {
              setAddresses(userData.addresses);
            }
            if (userData.defaultAddressId) {
              setDefaultAddressId(userData.defaultAddressId);
            }

            // parse mobile into country code and local phone if present
            const mobileRaw = userData.mobile || "";
            if (mobileRaw) {
              const m = mobileRaw.match(/^(\+\d{1,3})(.*)$/);
              if (m) {
                setCountryCode(m[1]);
                setPhone(m[2].replace(/\D/g, ""));
              } else {
                setCountryCode(userData.countryCode || "+1");
                setPhone(mobileRaw.replace(/\D/g, ""));
              }
            } else {
              setCountryCode(userData.countryCode || "+1");
              setPhone("");
            }
          } else {
            console.log("No such document in Firestore for email:", user.email);
            setFirestoreUser(null);
            setUserDocId(null);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setFirestoreUser(null);
          setUserDocId(null);
        }
      }
    };
    fetchUserData();
  }, [user?.email]);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");

  /* Mobile View State (Vertical Stack) */
  const [mobileView, setMobileView] = useState("menu"); // 'menu' | 'content'

  const handleMobileNav = (view) => {
    setActive(view);
    setMobileView("content");
  };

  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/account");
  };

  const MobileMenu = () => (
    <div className="mobile-menu-container">
      <div className="user-hero-card">
        <div className="avatar-placeholder">
          {firestoreUser?.name?.[0] || user?.email?.[0] || "U"}
        </div>
        <div className="user-details">
          <h3>{firestoreUser?.name || user?.displayName || "User"}</h3>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="mobile-nav-list">
        <button className="nav-item" onClick={() => handleMobileNav("profile")}>
          <div className="icon-wrapper">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span>My Profile</span>
          <span className="chevron">›</span>
        </button>

        <button className="nav-item" onClick={() => handleMobileNav("address")}>
          <div className="icon-wrapper">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span>Addresses</span>
          <span className="chevron">›</span>
        </button>

        <button className="nav-item" onClick={() => { navigate('/my/orders'); }}>
          <div className="icon-wrapper">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <span>Order History</span>
          <span className="chevron">›</span>
        </button>
        
        <button className="nav-item logout-item" onClick={handleLogout}>
          <div className="icon-wrapper">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
          </div>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!addressForm.fullName.trim()) {
      toast.error("Please enter full name");
      return;
    }
    if (!addressForm.mobileNumber.trim()) {
      toast.error("Please enter mobile number");
      return;
    }
    if (!addressForm.pincode.trim()) {
      toast.error("Please enter pincode");
      return;
    }
    // Validate Indian pincode (must be exactly 6 digits)
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
      toast.error(
        "Invalid pincode. Please enter a valid 6-digit Indian pincode"
      );
      return;
    }
    if (!addressForm.flatHouseNo.trim()) {
      toast.error("Please enter flat/house number");
      return;
    }
    if (!addressForm.areaStreet.trim()) {
      toast.error("Please enter area/street");
      return;
    }
    if (!addressForm.townCity.trim()) {
      toast.error("Please enter town/city");
      return;
    }
    if (!addressForm.state.trim()) {
      toast.error("Please select state");
      return;
    }

    if (!userDocId) {
      toast.error("User document not found");
      return;
    }

    setSavingAddress(true);
    try {
      const newAddress = {
        id:
          editingAddressIndex !== null
            ? addresses[editingAddressIndex].id
            : Date.now().toString(),
        country: addressForm.country,
        fullName: addressForm.fullName.trim(),
        mobileNumber: addressForm.mobileNumber.trim(),
        pincode: addressForm.pincode.trim(),
        flatHouseNo: addressForm.flatHouseNo.trim(),
        areaStreet: addressForm.areaStreet.trim(),
        landmark: addressForm.landmark.trim(),
        townCity: addressForm.townCity.trim(),
        state: addressForm.state.trim(),
        createdAt:
          editingAddressIndex !== null
            ? addresses[editingAddressIndex].createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedAddresses;
      if (editingAddressIndex !== null) {
        // Update existing address
        updatedAddresses = addresses.map((addr, idx) =>
          idx === editingAddressIndex ? newAddress : addr
        );
      } else {
        // Add new address
        updatedAddresses = [...addresses, newAddress];
      }

      await updateDoc(doc(db, "users", userDocId), {
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      });

      setAddresses(updatedAddresses);
      setShowAddressModal(false);
      setAddressForm({
        country: "India",
        fullName: "",
        mobileNumber: "",
        pincode: "",
        flatHouseNo: "",
        areaStreet: "",
        landmark: "",
        townCity: "",
        state: "",
      });
      setEditingAddressIndex(null);

      toast.success(
        editingAddressIndex !== null
          ? "Address updated successfully!"
          : "Address saved successfully!"
      );
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (index) => {
    setEditingAddressIndex(index);
    setAddressForm(addresses[index]);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const deletedAddressId = addresses[index].id;
      const updatedAddresses = addresses.filter((_, idx) => idx !== index);

      const updateData = {
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      };

      // If deleted address was default, clear default
      if (defaultAddressId === deletedAddressId) {
        updateData.defaultAddressId = null;
      }

      await updateDoc(doc(db, "users", userDocId), updateData);

      setAddresses(updatedAddresses);
      if (defaultAddressId === deletedAddressId) {
        setDefaultAddressId(null);
      }
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetAsDefault = async (addressId) => {
    try {
      await updateDoc(doc(db, "users", userDocId), {
        defaultAddressId: addressId,
        updatedAt: new Date().toISOString(),
      });

      setDefaultAddressId(addressId);
      toast.success("Default address set successfully!");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    }
  };

  const openAddAddressModal = () => {
    setEditingAddressIndex(null);
    setAddressForm({
      country: "India",
      fullName: "",
      mobileNumber: "",
      pincode: "",
      flatHouseNo: "",
      areaStreet: "",
      landmark: "",
      townCity: "",
      state: "",
    });
    setShowAddressModal(true);
  };

  const handleSavePhone = async () => {
    const rawNumber = (phone || "").replace(/\s+/g, "");
    if (!rawNumber) {
      toast.error("Please enter a mobile number");
      return;
    }

    // Ensure country code starts with +
    const cc = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
    const combined = `${cc}${rawNumber.replace(/\D/g, "")}`;

    // Validate using validator
    if (!validator.isMobilePhone(combined, "any")) {
      toast.error("Please enter a valid mobile number with country code");
      return;
    }

    if (!userDocId) {
      toast.error("User document not found");
      return;
    }

    setIsSavingPhone(true);
    try {
      await updateDoc(doc(db, "users", userDocId), {
        mobile: combined,
        countryCode: cc,
        updatedAt: new Date().toISOString(),
      });

      setFirestoreUser({ ...firestoreUser, mobile: combined, countryCode: cc });
      setIsEditingPhone(false);
      toast.success("Mobile number saved successfully!");
    } catch (error) {
      console.error("Error saving mobile number:", error);
      toast.error("Failed to save mobile number");
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <div className={`profile-dashboard ${mobileView === 'content' ? 'viewing-content' : 'viewing-menu'}`}>
      
      {/* MOBILE MENU (Visible only on mobile when view is 'menu') */}
      <div className="mobile-only-wrapper">
         {mobileView === 'menu' && <MobileMenu />}
      </div>

      {/* DESKTOP SIDEBAR (Hidden on mobile) */}
      <aside className="sidebar desktop-sidebar">
        <h2 className="logo">MyAccount</h2>

        <nav>
          <button
            className={active === "profile" ? "active" : ""}
            onClick={() => setActive("profile")}
          >
            <svg
              xmlns="http://www.
                        2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>{" "}
            Profile
          </button>

          <button
            className={active === "address" ? "active" : ""}
            onClick={() => setActive("address")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>{" "}
            Address
          </button>

          <button
            className={active === "orders" ? "active" : ""}
            onClick={() => navigate('/my/orders')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>{" "}
            Order History
          </button>

          <button className="logout" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>{" "}
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
         {/* Mobile Back Header */}
         <div className="mobile-content-header">
            <button className="back-btn" onClick={() => setMobileView('menu')}>
               ←
            </button>
            <h3>
               {active === 'profile' && 'Profile Details'}
               {active === 'address' && 'My Addresses'}
               {active === 'orders' && 'Order History'}
            </h3>
         </div>
         
        {active === "profile" && (
          <section className="card">
            <div className="profile-header">
              <h3>
                Welcome, {firestoreUser?.name || user?.displayName || "Guest"}!
              </h3>
              <p>Here is your profile information.</p>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span className="info-value">
                  {firestoreUser?.name || user?.displayName || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span className="info-value">{user?.email || "N/A"}</span>
              </div>
            </div>
          </section>
        )}

        {active === "address" && (
          <section className="card">
            <div className="address-header">
              <h3>Your Addresses</h3>
              <button className="add-address-btn" onClick={openAddAddressModal}>
                <span className="plus-icon">+</span>
                Add address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="no-addresses">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/535/535239.png"
                  alt="No address"
                />
                <p className="no-address-text">No Address Added</p>
                <p className="no-address-subtext">
                  It seems you haven't added any addresses yet. Add a new
                  address to speed up your checkout process.
                </p>
              </div>
            ) : (
              <div className="addresses-grid">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`address-card ${
                      defaultAddressId === addr.id ? "default" : ""
                    }`}
                  >
                    {defaultAddressId === addr.id && (
                      <div className="default-badge">Default</div>
                    )}
                    <h4>{addr.fullName}</h4>
                    <p className="address-text">
                      {addr.flatHouseNo}, {addr.areaStreet}
                    </p>
                    <p className="address-text">
                      {addr.townCity} - {addr.pincode}
                    </p>
                    <p className="address-text">
                      {addr.state}, {addr.country}
                    </p>
                    {addr.landmark && (
                      <p className="address-text">
                        <strong>Landmark:</strong> {addr.landmark}
                      </p>
                    )}
                    <p className="address-text">
                      <strong>Phone number:</strong> {addr.mobileNumber}
                    </p>
                    <div className="address-actions">
                      <button
                        className="action-link edit"
                        onClick={() => handleEditAddress(idx)}
                      >
                        Edit
                      </button>
                      <span className="separator">|</span>
                      <button
                        className="action-link remove"
                        onClick={() => handleDeleteAddress(idx)}
                      >
                        Remove
                      </button>
                      {defaultAddressId !== addr.id && (
                        <>
                          <span className="separator">|</span>
                          <button
                            className="action-link default"
                            onClick={() => handleSetAsDefault(addr.id)}
                          >
                            Set as Default
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
              <div
                className="modal-overlay"
                onClick={() => setShowAddressModal(false)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h2>Add new address</h2>
                    <button
                      className="modal-close"
                      onClick={() => setShowAddressModal(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <form
                    className="address-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveAddress();
                    }}
                  >
                    <div className="form-group">
                      <label>Country/Region</label>
                      <select
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressFormChange}
                      >
                        <option value="India">India</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Full name (First and Last name) *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressFormChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Mobile number *</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={addressForm.mobileNumber}
                        onChange={handleAddressFormChange}
                        placeholder="Enter mobile number"
                      />
                      <small>May be used to assist delivery</small>
                    </div>

                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={addressForm.pincode}
                        onChange={handleAddressFormChange}
                        placeholder="6 digits [0-9] PIN code"
                        maxLength="6"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Flat, House no., Building, Company, Apartment *
                      </label>
                      <input
                        type="text"
                        name="flatHouseNo"
                        value={addressForm.flatHouseNo}
                        onChange={handleAddressFormChange}
                        placeholder="Enter flat/house number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Area, Street, Sector, Village *</label>
                      <input
                        type="text"
                        name="areaStreet"
                        value={addressForm.areaStreet}
                        onChange={handleAddressFormChange}
                        placeholder="Enter area/street"
                      />
                    </div>

                    <div className="form-group">
                      <label>Landmark</label>
                      <input
                        type="text"
                        name="landmark"
                        value={addressForm.landmark}
                        onChange={handleAddressFormChange}
                        placeholder="E.g. near apollo hospital"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Town/City *</label>
                        <input
                          type="text"
                          name="townCity"
                          value={addressForm.townCity}
                          onChange={handleAddressFormChange}
                          placeholder="Enter town/city"
                        />
                      </div>

                      <div className="form-group">
                        <label>State *</label>
                        <select
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressFormChange}
                        >
                          <option value="">Choose a state</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">
                            Arunachal Pradesh
                          </option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">
                            Himachal Pradesh
                          </option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setShowAddressModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-save"
                        disabled={savingAddress}
                      >
                        {savingAddress ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {active === "orders" && (
          <section className="card">
            <h3 style={{marginBottom: "1.5rem"}}>Order History</h3>
            <MyOrders embedded={true} />
          </section>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
