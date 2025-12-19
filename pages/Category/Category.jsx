import { useEffect, useState } from "react";
import "./Category.scss";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase.js";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import noProductsImg from "../../src/assets/react.svg";

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"), where("category", "==", category));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      getProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [category]);

  const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category";

  const allowedCategories = ["pickles", "sweets", "snacks", "chillies"];
  const normalizedCategory = category ? category.toLowerCase() : "";
  const invalidCategory = category && !allowedCategories.includes(normalizedCategory);

  // Filtering & sorting helpers
  const getMinPrice = (p) => {
    const prices = [p.price_250, p.price_500, p.price_1000].filter((v) => typeof v === "number" && v > 0);
    return prices.length ? Math.min(...prices) : Infinity;
  };

  const filtered = products.filter((p) => {
    if (!filterText) return true;
    return p.name?.toLowerCase().includes(filterText.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "az") return (a.name || "").localeCompare(b.name || "");
    if (sortOption === "price-asc") return getMinPrice(a) - getMinPrice(b);
    if (sortOption === "price-desc") return getMinPrice(b) - getMinPrice(a);
    if (sortOption === "newest") {
      const ta = a.createdAt ? a.createdAt.seconds ?? a.createdAt : 0;
      const tb = b.createdAt ? b.createdAt.seconds ?? b.createdAt : 0;
      return tb - ta;
    }
    return 0;
  });

  // Pagination helpers (use sorted list)
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginatedProducts = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    // reset page when category or product count or filters change
    setCurrentPage(1);
  }, [category, products.length, filterText, sortOption]);

  return (
    <div className="category-page">
      {invalidCategory && (
        <div className="invalid-category">
          <div className="invalid-media">
            <img src={noProductsImg} alt="No products" />
          </div>
          <div className="invalid-body">
            <h1>Oops — No Products</h1>
            <p>We couldn't find any products for "{category}".</p>
            <Link to="/" className="btn-home">Go to Home</Link>
          </div>
        </div>
      )}

      {!invalidCategory && (
        <>
          <div className="category-header">
            <h1>{title}</h1>
            <p className="category-count">
              {!loading && `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="category-controls">
            <div className="search-box">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
              <input
                type="text"
                placeholder="Search products, e.g. Darjeeling, Assam..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="filter-input"
              />
              {filterText && (
                <button className="clear-filter" onClick={() => setFilterText("")} aria-label="Clear filter">✕</button>
              )}
            </div>

            <div className="sort-group" role="tablist" aria-label="Sort products">
              <button className={`sort-btn ${sortOption === 'az' ? 'active' : ''}`} onClick={() => setSortOption('az')}>A - Z</button>
              <button className={`sort-btn ${sortOption === 'price-asc' ? 'active' : ''}`} onClick={() => setSortOption('price-asc')}>Price ↑</button>
              <button className={`sort-btn ${sortOption === 'price-desc' ? 'active' : ''}`} onClick={() => setSortOption('price-desc')}>Price ↓</button>
              <button className={`sort-btn ${sortOption === 'newest' ? 'active' : ''}`} onClick={() => setSortOption('newest')}>Newest</button>
              <button className="clear-btn" onClick={() => { setFilterText(''); setSortOption(''); }} aria-label="Clear all filters">Clear</button>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="skeleton-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className="skeleton-card" key={i}>
                    <div className="skeleton-image" />
                    <div className="skeleton-body">
                      <div className="skeleton-line short" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line small" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="empty">No products found in this category.</div>
          ) : sorted.length === 0 ? (
            <div className="no-results">
              <div className="no-results-illustration" aria-hidden>
                <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0" stopColor="#f3f4f6" />
                      <stop offset="1" stopColor="#eef2ff" />
                    </linearGradient>
                  </defs>
                  <rect x="12" y="14" width="72" height="84" rx="8" fill="url(#g1)" />
                  <rect x="96" y="20" width="72" height="56" rx="8" fill="#F8FAFC" />
                  <g transform="translate(38,50)">
                    <circle cx="0" cy="0" r="10" fill="#fff" opacity="0.6" />
                  </g>
                  {/* sad face */}
                  <g transform="translate(90,62)">
                    <circle cx="0" cy="0" r="22" fill="#fff" stroke="#E5E7EB" />
                    <circle cx="-8" cy="-6" r="3" fill="#9CA3AF" />
                    <circle cx="8" cy="-6" r="3" fill="#9CA3AF" />
                    <path d="M -10 6 Q 0 14 10 6" stroke="#9CA3AF" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
              <h3>No results found</h3>
              <p>Sorry, we can't find any products that match your filters. Please clear your selected filters and try again.</p>
            </div>
          ) : (
            <div>
              <div className="products-grid">
                {paginatedProducts.map((data) => (
                  <Link key={data.id} to={`/product/${data.id}`} className="product-link">
                    <ProductCard data={data} />
                  </Link>
                ))}
              </div>

              {products.length > itemsPerPage && (
                <div className="pagination">
                  <button
                    className="page-btn prev"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        className={`page-btn ${page === currentPage ? "active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    className="page-btn next"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
