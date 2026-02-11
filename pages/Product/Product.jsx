import "./Product.scss";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase.js";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import QuantitySelector from "../../components/QuantitySelector/QuantitySelector.jsx";
import InvalidProduct from "../InvalidProduct/InvalidProduct";
import { addToCart as addToCartAction } from "../../config/cartSlice";

const WEIGHTS = [
    { size: 250, label: "250G", priceKey: "price_250" },
    { size: 500, label: "500G", priceKey: "price_500" },
    { size: 1000, label: "1KG", priceKey: "price_1000" },
];

/* Small modular components outside of render */
const Stock = ({ quantity }) => (
    <div className={`stock ${quantity > 0 ? 'in' : 'out'}`}>
        {quantity > 0 ? 'In Stock' : 'Out of stock'}
    </div>
);

const AboutProduct = ({ description }) => (
    <div className="about-product">
        <h4>About This Product</h4>
        <p>{description}</p>
        <ul className="bullet-list">
            <li>Handmade using traditional recipes</li>
            <li>Made from fresh ingredients</li>
            <li>No artificial preservatives</li>
        </ul>
    </div>
);

const Product = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedQuantities, setSelectedQuantities] = useState({ 250: 0, 500: 0, 1000: 0 });
    const [totalPrice, setTotalPrice] = useState(0);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        const productRef = doc(db, "products", id);
        
        // Listen for real-time updates using onSnapshot
        const unsubscribe = onSnapshot(productRef, (docSnap) => {
            if (docSnap.exists()) {
                setProduct({
                    id: docSnap.id,
                    ...docSnap.data(),
                });
            } else {
                setProduct(null);
                console.log("product not found");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching product:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        setSelectedQuantities({ 250: 0, 500: 0, 1000: 0 });
    }, [id]);

    const addToCart = () => {
        const items = WEIGHTS.filter((w) => (selectedQuantities[w.size] || 0) > 0);
        if (items.length === 0) return;
        setAdding(true);
        setTimeout(() => {
            setAdding(false);

            // Dispatch to Redux - one dispatch per weight
            items.forEach((weight) => {
                const qty = selectedQuantities[weight.size];
                dispatch(addToCartAction({
                    productId: product.id,
                    name: product.name,
                    image: product.imageURL || "",
                    weight: weight.label,
                    price: product[weight.priceKey] || 0,
                    quantity: qty,
                    maxQuantity: Number(product.quantity || 0), // Pass total available stock
                }));
            });

            // Reset quantities after adding
            setSelectedQuantities({ 250: 0, 500: 0, 1000: 0 });

            // Show toast notification
            toast.success("Product added successfully", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: "custom-toast",
                bodyClassName: "custom-toast-body",
                style: {
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                },
            });

        }, 700);
    };

    const handleBuyNow = () => {
        const items = WEIGHTS.filter((w) => (selectedQuantities[w.size] || 0) > 0);
        if (items.length === 0) return;

        items.forEach((weight) => {
            const qty = selectedQuantities[weight.size];
            dispatch(addToCartAction({
                productId: product.id,
                name: product.name,
                image: product.imageURL || "",
                weight: weight.label,
                price: product[weight.priceKey] || 0,
                quantity: qty,  
                maxQuantity: Number(product.quantity || 0),
            }));
        });
        navigate('/cart');
    };

    if (loading)
        return (
            <div className="product">
                <div className="product-inner">
                    <div className="product-left">
                        <div className="gallery">
                            <div className="skeleton skeleton-image" />
                        </div>
                    </div>

                    <div className="product-right">
                        <div className="product-meta">
                            <div className="skeleton-line title" />
                            <div className="skeleton-line sub" />
                            <div className="skeleton-line price" />
                            <div style={{ height: 16 }} />
                            <div className="skeleton-line desc-1" />
                            <div className="skeleton-line desc-2" />
                            <div className="skeleton-line desc-3" />

                            <div style={{ height: 16 }} />
                            <div className="skeleton-line small" />
                            <div style={{ height: 12 }} />
                            <div className="skeleton-buttons">
                                <div className="skeleton-btn" />
                                <div className="skeleton-btn" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    if (!product) return <InvalidProduct />;

    const spiceLevel = parseInt(product.spice_level || 0, 10);
    const sweetLevel = parseInt(product.sweet_level || 0, 10);
    const isSweet = product.category?.toLowerCase().includes("sweet") || sweetLevel > 0;
    // Explicitly parse quantity to number to handle "0" strings or undefined safely
    const productQuantity = Number(product.quantity || 0);
    const isOutOfStock = productQuantity <= 0;

    return (
        <div className="product">
            <div className="product-inner">
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to={`/category/${product.category}`}>{product.category}</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                <div className="product-content">
                    <div className="product-left">
                        <div className="gallery">
                            <div className="main-image">
                                <img src={product.imageURL} alt={product.name} />
                            </div>
                        </div>

                        <div className="product-details-wrapper">
                            <AboutProduct name={product.name} description={product.description} />

                            <div className="ingredients">
                                <h4>Ingredients</h4>
                                <div className="ing-list">
                                    {Array.isArray(product.ingredients) &&
                                        product.ingredients.map((ing, idx) => (
                                            <span key={idx} className="chip">
                                                {ing}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="product-right">
                        <div className="product-meta">
                            <div className="category">{product.category}</div>
                            <h1 className="product-title">{product.name}</h1>

                            <Stock quantity={productQuantity} />

                            <hr className="sep" />

                            <div className={`spice-level ${isSweet ? 'sweet-mode' : ''}`}>
                                <div className="label">{isSweet ? "Sweet Level:" : "Spice Level:"}</div>
                                <div className="chilis">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <i
                                            key={i}
                                            className={`fa-solid ${isSweet ? 'fa-ice-cream' : 'fa-pepper-hot'} ${
                                                i < (isSweet ? sweetLevel : spiceLevel) ? 'active' : ''
                                            }`}
                                        ></i>
                                    ))}
                                </div>
                            </div>

                            <hr className="sep" />

                            <div className="prices-section">
                                {WEIGHTS.map((w) => (
                                    <div key={w.size} className="price-row">
                                        <div className="price-label">
                                            <span className="weight">{w.label}</span>
                                            <span className="price">₹ {product[w.priceKey] || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <QuantitySelector
                                totalAvailableGrams={productQuantity}
                                initialQuantities={selectedQuantities}
                                disabled={isOutOfStock}
                                priceMap={{
                                    250: product.price_250 || 0,
                                    500: product.price_500 || 0,
                                    1000: product.price_1000 || 0,
                                }}
                                onChange={(q, totalGrams, price) => {
                                    setSelectedQuantities(q);
                                    setTotalPrice(price);
                                }}
                            />

                            <div className="price-summary">
                                <span className="price-label">Total Price:</span>
                                <span className="price-amount">₹ {totalPrice.toFixed(2)}</span>
                            </div>

                            <div className="actions">
                                <button
                                    className={`btn add ${adding ? 'loading' : ''}`}
                                    onClick={addToCart}
                                    disabled={Object.values(selectedQuantities).reduce((s, v) => s + v, 0) === 0 || adding || isOutOfStock}
                                    aria-disabled={Object.values(selectedQuantities).reduce((s, v) => s + v, 0) === 0 || adding || isOutOfStock}
                                >
                                    {adding ? (
                                        <span className="btn-content">
                                            <span className="spinner" aria-hidden="true" /> Adding...
                                        </span>
                                    ) : (
                                        <span className="btn-content">
                                            <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                        </span>
                                    )}
                                </button>

                                <button
                                    className="btn buy"
                                    onClick={handleBuyNow}
                                    disabled={Object.values(selectedQuantities).reduce((s, v) => s + v, 0) === 0 || isOutOfStock}
                                    aria-disabled={Object.values(selectedQuantities).reduce((s, v) => s + v, 0) === 0 || isOutOfStock}
                                >
                                    <span className="btn-content">Buy Now</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );

};

export default Product;
