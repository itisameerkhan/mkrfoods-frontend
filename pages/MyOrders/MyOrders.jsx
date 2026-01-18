import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import './MyOrders.scss';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const user = useSelector((store) => store.user);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return; // Wait for user to be available in Redux

            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_API_URL}/api/payment/my-orders?userId=${user.uid}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load your orders.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        } else {
             // If no user in Redux after some time, we might want to redirect. 
             // But for now, just keep loading until Redux is populated (App.jsx handles this).
             // We can check local storage as a fallback if needed or let App handle auth state.
             const checkAuth = setTimeout(() => {
                 const auth = getAuth();
                 if(!auth.currentUser) {
                     navigate('/account');
                 }
             }, 2000);
             return () => clearTimeout(checkAuth);
        }

    }, [user, navigate]);

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="page-header">
                    <h1>My Orders</h1>
                    <p>Track your past purchases and status</p>
                </div>
                <div className="skeleton-loading">
                    {[1, 2].map((n) => (
                        <div key={n} className="skeleton-card">
                            <div className="skeleton-header">
                                <div className="s-meta">
                                    <div className="s-id"></div>
                                    <div className="s-date"></div>
                                </div>
                                <div className="s-status"></div>
                            </div>
                            <div className="skeleton-body">
                                <div className="s-item">
                                    <div className="s-img"></div>
                                    <div className="s-details">
                                        <div className="s-title"></div>
                                        <div className="s-variant"></div>
                                    </div>
                                    <div className="s-price"></div>
                                </div>
                                <div className="s-item">
                                    <div className="s-img"></div>
                                    <div className="s-details">
                                        <div className="s-title"></div>
                                        <div className="s-variant"></div>
                                    </div>
                                    <div className="s-price"></div>
                                </div>
                            </div>
                            <div className="skeleton-footer">
                                <div className="s-total-label"></div>
                                <div className="s-total-value"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="page-header">
                <h1>My Orders</h1>
                <p>Track your past purchases and status</p>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="icon">📦</div>
                    <h2>No orders yet</h2>
                    <p>Looks like you haven't ordered anything yet.</p>
                    <button onClick={() => navigate('/')} className="btn-shop">Start Shopping</button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.filter(order => order.status === 'success' || order.status === 'captured').map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-meta">
                                    <span className="order-id">Order #{order.orderId ? order.orderId.slice(-8).toUpperCase() : 'N/A'}</span>
                                    <div className="order-dates">
                                        <span className="order-date">
                                            Ordered: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        {/* Display Expected Date */}
                                        <span className="expected-date">
                                            <b>Expected: {order.expectedDate || "Updated soon"}</b>
                                        </span>
                                    </div>
                                </div>
                                {/* Display Order Status (e.g., In Transit, Delivered) */}
                                <div className={`order-status-badge ${order.orderStatus ? order.orderStatus.toLowerCase().replace(/\s/g, '-') : 'in-transit'}`}>
                                    {order.orderStatus || "In Transit"}
                                </div>
                            </div>

                            <div className="order-items">
                                {order.cart && order.cart.items && order.cart.items.length > 0 ? (
                                    order.cart.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <div className="item-img">
                                                <img src={item.image} alt={item.name} onError={(e) => e.target.src = 'https://via.placeholder.com/60'} />
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.name}</h4>
                                                <div className="item-variants">
                                                    {item.variants && item.variants.map((v, idx) => (
                                                        <span key={idx} className="variant-badge">
                                                            {v.weight} x {v.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                ₹{item.totalPrice}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-item-details">Item details not available for this order.</p>
                                )}
                            </div>

                            {/* Delivery Address Section */}
                            {order.address && (
                                <div className="order-address">
                                    <h5>Delivery Address</h5>
                                    <div className="address-content">
                                        <div className="addr-icon">
                                            {/* Location Pin Icon SVG */}
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 13.43C13.7231 13.43 15.12 12.0331 15.12 10.31C15.12 8.58687 13.7231 7.19 12 7.19C10.2769 7.19 8.88 8.58687 8.88 10.31C8.88 12.0331 10.2769 13.43 12 13.43Z" stroke="#ff6b6b" strokeWidth="1.5"/>
                                                <path d="M3.62 13.32H3.68C4.7 17.15 8.16 20.25 12 21.5C15.84 20.25 19.3 17.15 20.32 13.32C21.43 9.16 19.46 4.79 15.65 2.87C11.84 0.95 7.02 2.21 4.75 5.61C3.89 6.89 3.42 8.35 3.42 9.85C3.42 11.08 3.5 12.24 3.62 13.32Z" stroke="#ff6b6b" strokeWidth="1.5"/>
                                            </svg>
                                        </div>
                                        <div className="addr-details">
                                            <p className="addr-name">{order.address.fullName || order.address.name}</p>
                                            <p>{[
                                                order.address.flatHouseNo,
                                                order.address.areaStreet,
                                                order.address.landmark
                                            ].filter(Boolean).join(', ')}</p>
                                            <p>{order.address.townCity} - {order.address.pincode}</p>
                                            <div className="addr-phone-row">
                                                {/* Phone Icon SVG */}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z" stroke="#666" strokeWidth="1.5" strokeMiterlimit="10"/>
                                                </svg>
                                                <span>{order.address.mobileNumber || order.address.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="order-footer">
                                <div className="order-total">
                                    <span>Total Amount</span>
                                    <h3>₹{order.amount / 100}</h3> 
                                    {/* Razorpay stores amount in paise, so divide by 100 */}
                                </div>
                                {/* <button className="btn-track">Track Order</button> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
