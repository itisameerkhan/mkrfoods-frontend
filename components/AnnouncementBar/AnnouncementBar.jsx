import React, { useEffect, useState } from "react";
import "./AnnouncementBar.scss";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../../config/firebase";

const AnnouncementBar = () => {
  const [text, setText] = useState(
    "🚚 Free Delivery on orders above ₹1000! ✨ Authentic Indian Flavors at your doorstep"
  );

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const q = query(collection(db, "coupons"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          if (data.code && data.discountPrice) {
            setText(`🔥 Use code ${data.code} for ₹${data.discountPrice} OFF on orders above ₹${data.minimumOrder}! \u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0 🚚 Free Delivery on orders above ₹1000!`);
          }
        }
      } catch (error) {
        console.error("Error fetching marquee coupon:", error);
      }
    };
    
    fetchCoupon();
  }, []);

  // Create a repeated string safely
  const BLOCK_COUNT = 4;
  const SEPARATOR = " \u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0 ";
  
  // Construct the content block that repeats
  const contentBlock = Array(BLOCK_COUNT).fill(null).map((_, i) => (
      <span key={i}>
          {text} {SEPARATOR}
      </span>
  ));

  return (
    <div className="announcement-bar">
      <div className="marquee-track">
         <div className="marquee-content">{contentBlock}</div>
         <div className="marquee-content">{contentBlock}</div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
