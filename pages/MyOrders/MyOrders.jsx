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
                <div className="orders-loader">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
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
                                <div className="header-top">
                                    <span className="order-id">#{order.orderId ? order.orderId.slice(-8).toUpperCase() : 'N/A'}</span>
                                    <span className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <div className="header-status-row">
                                     <div className="delivery-info">
                                        <div className="d-icon">
                                            {/* Truck Icon */}
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 17H5C3.89543 17 3 16.1046 3 15V7C3 5.89543 3.89543 5 5 5H15M19 17C20.1046 17 21 16.1046 21 15V11C21 10.4477 20.5523 10 20 10H15M19 17V17.5M15 5V10M15 10V17M15 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="1.5"/>
                                                <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                        </div>
                                        <div className="d-text">
                                            <span className="label">Expected Delivery</span>
                                            <span className="value">{order.expectedDate || "Arriving soon"}</span>
                                        </div>
                                     </div>

                                    <div className={`order-status-badge ${order.orderStatus ? order.orderStatus.toLowerCase().replace(/\s/g, '-') : 'in-transit'}`}>
                                        {order.orderStatus || "In Transit"}
                                    </div>
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
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.28 1.12.27 2.33.42 3.6.42.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.15 2.45.42 3.6.08.35-.01.74-.27 1.02l-2.2 2.2z"/>
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
