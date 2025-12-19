import { Link } from "react-router-dom";
import "./InvalidProduct.scss";

const InvalidProduct = () => {
  return (
    <div className="invalid-page">
      <div className="invalid-inner">
        <div className="illustration" aria-hidden="true">
          {/* simple stylized TV / monitor with color bars */}
          <svg
            width="360"
            height="240"
            viewBox="0 0 360 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="6"
              y="6"
              width="348"
              height="228"
              rx="18"
              fill="#fff"
              stroke="#e6e6e6"
            />
            <rect x="28" y="28" width="304" height="160" rx="8" fill="#111" />
            <g transform="translate(40,40)">
              <rect x="0" y="0" width="224" height="20" rx="3" fill="#e74c3c" />
              <rect
                x="0"
                y="26"
                width="224"
                height="20"
                rx="3"
                fill="#f39c12"
              />
              <rect
                x="0"
                y="52"
                width="224"
                height="20"
                rx="3"
                fill="#f1c40f"
              />
              <rect
                x="0"
                y="78"
                width="224"
                height="20"
                rx="3"
                fill="#2ecc71"
              />
              <rect
                x="0"
                y="104"
                width="224"
                height="20"
                rx="3"
                fill="#3498db"
              />
            </g>
            <rect
              x="24"
              y="196"
              width="312"
              height="16"
              rx="8"
              fill="#f6f6f6"
            />
            <circle cx="48" cy="200" r="6" fill="#e74c3c" />
          </svg>
        </div>

        <div className="invalid-copy">
          <h1>Oops!</h1>
          <p className="muted">
            We couldn't find the product you were looking for.
          </p>
          <div className="actions">
            <Link to="/" className="btn primary">
              ← Go home
            </Link>
            <Link to="/" className="btn ghost">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvalidProduct;
