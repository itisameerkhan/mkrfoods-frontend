import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-cols">
                    <div className="col about">
                        <h3><span>MKR</span> Foods</h3>
                        <p>
                            Bringing you authentic Indian flavours with our handcrafted
                            pickles, snacks, and sweets made from traditional family
                            recipes.
                        </p>
                        <div className="socials">
                            <a href="#" aria-label="instagram"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#" aria-label="facebook"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" aria-label="youtube"><i className="fa-brands fa-youtube"></i></a>
                        </div>
                    </div>

                    <div className="col links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Products</a></li>
                            <li><a href="#">Contact</a></li>
                            <li><a href="#">FAQs</a></li>
                        </ul>
                    </div>

                    <div className="col categories">
                        <h4>Categories</h4>
                        <ul>
                            <li><a href="#">Pickles</a></li>
                            <li><a href="#">Snacks</a></li>
                            <li><a href="#">Sweets</a></li>
                            <li><a href="#">Chillis</a></li>
                        </ul>
                    </div>

                    <div className="col contact">
                        <h4>Contact Us</h4>
                        <ul className="contact-list">
                            <li><i className="fa-regular fa-envelope"></i> mkrfoods@zohomail.in</li>
                            <li><i className="fa-solid fa-phone"></i> +91-9502770138</li>
                            <li><i className="fa-solid fa-location-dot"></i> Bangalore, India</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copy">© 2024 MKR Foods. All rights reserved.</div>
                    <div className="policies">
                        <Link to="/policy">Privacy Policy</Link>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>

            <div className="footer-marquee">
                <div className="marquee-content">
                    <span>Designed & Developed by <strong>Ameer Khan</strong> • Contact for Web Designs & Server Management: <strong>itisameerkhan@gmail.com</strong></span>
                    <span>Designed & Developed by <strong>Ameer Khan</strong> • Contact for Web Designs & Server Management: <strong>itisameerkhan@gmail.com</strong></span>
                    <span>Designed & Developed by <strong>Ameer Khan</strong> • Contact for Web Designs & Server Management: <strong>itisameerkhan@gmail.com</strong></span>
                    <span>Designed & Developed by <strong>Ameer Khan</strong> • Contact for Web Designs & Server Management: <strong>itisameerkhan@gmail.com</strong></span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

