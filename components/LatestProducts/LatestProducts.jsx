import "./LatestProduct.scss";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { Link } from "react-router-dom";

const LatestProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setProducts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error('LatestProducts snapshot error', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) {
    const placeholders = Array.from({ length: 8 });
    return (
      <div className="latest-products">
        <div className="latest-products-main">
          <div className="lp1">
            <p>
              Latest <span>Products</span>
            </p>
            <p>Our most loved products by customers across India</p>
          </div>
          <div className="product-cards">
            {placeholders.map((_, i) => (
              <div className="skeleton-card" key={i}>
                <div className="skel-img" />
                <div className="skel-details">
                  <div className="skel-line title" />
                  <div className="skel-grid-row">
                      <div className="skel-box" />
                      <div className="skel-box" />
                      <div className="skel-box" />
                  </div>
                  <div className="skel-footer-row">
                      <div className="skel-badge" />
                      <div className="skel-btn" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && products.length === 0) return <h2 style={{ textAlign: 'center' }}>No products found</h2>;

  return (
    <div className="latest-products">
      <div className="latest-products-main">
        <div className="lp1">
          <p>
            Latest <span>Products</span>
          </p>
          <p>Our most loved products by customers across India</p>
        </div>
        <div className="product-cards">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <ProductCard data={product} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestProducts;
