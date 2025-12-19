import "./Description.scss";

const Description = () => {
    return (
        <section className="description">
            <div className="desc-inner">
                <div className="desc-top">
                    <h2>
                        Why <span>MKR Foods</span>?
                    </h2>
                    <p className="desc-sub">We bring the authentic taste of traditional Indian kitchens to your home</p>
                </div>

                <div className="features">
                    <div className="feature">
                        <div className="icon-box">
                            <i className="fa-solid fa-check"></i>
                        </div>
                        <h3>100% Homemade Taste</h3>
                        <p>Every product is crafted with the same love and care as in Indian kitchens.</p>
                    </div>

                    <div className="feature">
                        <div className="icon-box">
                            <i className="fa-solid fa-leaf"></i>
                        </div>
                        <h3>Premium Quality Ingredients</h3>
                        <p>We source only the finest ingredients for authentic flavours.</p>
                    </div>

                    <div className="feature">
                        <div className="icon-box">
                            <i className="fa-solid fa-award"></i>
                        </div>
                        <h3>Traditional Recipes</h3>
                        <p>Recipes passed down through generations for authentic taste.</p>
                    </div>

                    <div className="feature">
                        <div className="icon-box">
                            <i className="fa-solid fa-truck"></i>
                        </div>
                        <h3>Pan-India Delivery</h3>
                        <p>Fresh products delivered to your doorstep across India.</p>
                    </div>
                </div>

                <div className="stats-wrap">
                    <div className="stats">
                        <div className="stat">
                            <div className="stat-num">50+</div>
                            <div className="stat-label">Products</div>
                        </div>

                        <div className="stat">
                            <div className="stat-num">10,000+</div>
                            <div className="stat-label">Happy Customers</div>
                        </div>

                        <div className="stat">
                            <div className="stat-num">500+</div>
                            <div className="stat-label">Cities Delivered</div>
                        </div>

                        <div className="stat">
                            <div className="stat-num">4.8★</div>
                            <div className="stat-label">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Description;
