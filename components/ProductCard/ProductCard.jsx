import "./ProductCard.scss";

const ProductCard = ({ data }) => {
  const { name, imageURL, price_250, price_500, price_1000, quantity, category } = data;
  const inStock = quantity > 0;

  const sizes = [
    { label: '250g', price: price_250 },
    { label: '500g', price: price_500 },
    { label: '1kg', price: price_1000 },
  ];

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={imageURL} alt={name} />
        {category && <div className="category-tag">{category}</div>}
      </div>

      <div className="product-details">
        <p className="product-name">{name}</p>

        <div className="sizes-grid">
          {sizes.map((size, idx) => (
            size.price > 0 && (
              <div key={idx} className="size-card">
                <span className="size-label">{size.label}</span>
                <span className="size-price">₹{size.price}</span>
              </div>
            )
          ))}
        </div>

        <div className="card-footer">
          {inStock ? (
            <button className="add-btn">
              Add
            </button>
          ) : (
            <span className="stock-badge out">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
