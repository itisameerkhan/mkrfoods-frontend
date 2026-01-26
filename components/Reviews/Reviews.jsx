
import React from "react";
import "./Reviews.scss";

const reviews = [
    {
        id: 1,
        name: "Priya Sharma",
        city: "Mumbai",
        initials: "PS",
        rating: 5,
        text:
            "The mango pickle reminds me of my grandmother's recipe. Absolutely authentic taste! Will definitely order again.",
    },
    {
        id: 2,
        name: "Rajesh Kumar",
        city: "Delhi",
        initials: "RK",
        rating: 5,
        text:
            "Best quality pickles I've found online. The packaging is excellent and delivery was on time. Highly recommended!",
    },
    {
        id: 3,
        name: "Anita Reddy",
        city: "Hyderabad",
        initials: "AR",
        rating: 5,
        text: "Their besan ladoos are to die for! So fresh and delicious. My whole family loved them.",
    },
    {
        id: 4,
        name: "Ameer Khan",
        city: "Tamil Nadu",
        initials: "AK",
        rating: 5,
        text:
            "Great variety of snacks and pickles. The namkeen mix is our family's new favourite for evening tea.",
    },
];

const Stars = ({ count = 5 }) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <i
                key={i}
                className={"fa-solid fa-star" + (i < count ? " filled" : "")}
                aria-hidden
            ></i>
        );
    }
    return <div className="stars">{stars}</div>;
};

const Reviews = () => {
    return (
        <section className="reviews">
            <div className="reviews-inner">
                <div className="reviews-top">
                    <h2>
                        Customer <span>Reviews</span>
                    </h2>
                    <p className="reviews-sub">See what our customers are saying about MKR Foods</p>
                </div>

                <div className="reviews-grid">
                    {reviews.map((r) => (
                        <article className="review-card" key={r.id}>
                            <div className="quote">“”</div>

                            <Stars count={r.rating} />

                            <p className="review-text">"{r.text}"</p>

                            <div className="review-author">
                                <div className="avatar">{r.initials}</div>
                                <div className="author-meta">
                                    <div className="author-name">{r.name}</div>
                                    <div className="author-city">{r.city}</div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reviews;

