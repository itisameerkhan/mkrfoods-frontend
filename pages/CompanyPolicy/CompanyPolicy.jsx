import React from "react";
import "./CompanyPolicy.scss";

const CompanyPolicy = () => {
  return (
    <div className="company-policy-page">
      <div className="privacy-container">
        <header className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: August 20, 2025</p>
        </header>

        <section className="policy-intro">
          <p>
            <strong>MKR Foods</strong> (“MKR Foods,” “we,” “our,” or “us”) values your privacy. 
            This Privacy Policy explains how we collect, use, protect, and handle your personal information 
            when you visit or make purchases through our website.
          </p>
        </section>

        <div className="policy-sections">
          <section className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>We may collect the following types of information when you interact with our website:</p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address</li>
              <li><strong>Order & Transaction Details:</strong> Product orders, payment status (payments are processed securely via trusted payment gateways; we do not store card details)</li>
              <li><strong>Login Information:</strong> Account credentials (encrypted and securely handled)</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device information, pages visited, and usage data via cookies or similar technologies</li>
              <li><strong>Customer Communications:</strong> Information you provide through contact forms, emails, or support messages</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and fulfill orders</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Manage user accounts and secure logins</li>
              <li>Improve website performance, products, and user experience</li>
              <li>Send order updates, service-related messages, or promotional content (only if you opt in)</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Data Security & Encryption</h2>
            <ul>
              <li>All user login data is <strong>encrypted</strong></li>
              <li>We <strong>do not store sensitive information</strong> such as passwords in plain text</li>
              <li>We <strong>do not save user data locally</strong> on devices</li>
              <li>Secure servers and best industry practices are used to protect your data</li>
            </ul>
            <p className="note">While we take strong security measures, no online system can be guaranteed 100% secure.</p>
          </section>

          <section className="policy-section">
            <h2>4. How We Share Your Information</h2>
            <p>We <strong>do not sell</strong> your personal information. We may share limited data only:</p>
            <ul>
              <li>With trusted service providers (payment gateways, hosting, analytics, delivery partners) strictly for business operations</li>
              <li>When required by law or legal process</li>
              <li>In case of business restructuring or ownership transfer</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Cookies & Tracking Technologies</h2>
            <p>Our website uses cookies to:</p>
            <ul>
              <li>Ensure smooth website functionality</li>
              <li>Analyze traffic and usage patterns</li>
              <li>Improve user experience</li>
            </ul>
            <p>You can control or disable cookies through your browser settings.</p>
          </section>

          <section className="policy-section">
            <h2>6. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to:</p>
            <ul>
              <li>Fulfill orders</li>
              <li>Provide services</li>
              <li>Meet legal or regulatory obligations</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>7. Your Privacy Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> your personal information</li>
              <li><strong>Correct</strong> inaccurate or incomplete data</li>
              <li><strong>Request deletion</strong> of your data (subject to legal requirements)</li>
              <li><strong>Withdraw consent</strong> for marketing communications</li>
              <li><strong>Opt out</strong> of promotional emails at any time</li>
            </ul>
            <p>To exercise your rights, contact us using the details below.</p>
          </section>

          <section className="policy-section">
            <h2>8. Children’s Privacy</h2>
            <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section className="policy-section">
            <h2>9. International Users</h2>
            <p>If you access our website from outside India, your data may be processed in countries with different data protection laws. By using our website, you consent to such processing.</p>
          </section>

          <section className="policy-section">
            <h2>10. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy occasionally. Any changes will be reflected by updating the “Last Updated” date above.</p>
          </section>

          <div className="contact-box">
            <h2>11. Contact Information</h2>
            <p>If you have any questions or concerns about this Privacy Policy or your data, please contact:</p>
            
            <div className="contact-details">
              <strong>Ameer Khan</strong>
              <span>(Website & Data Administrator – MKR Foods)</span>
              
              <div className="contact-row">
                <i className="fa-solid fa-phone"></i>
                <div>
                  <a href="tel:9502770138">9502770138</a>, <a href="tel:8838051597">8838051597</a>
                </div>
              </div>
              
              <div className="contact-row">
                <i className="fa-solid fa-envelope"></i>
                <a href="mailto:itisameerkhan@gmail.com">itisameerkhan@gmail.com</a>
              </div>
              
              <div className="contact-row">
                <i className="fa-solid fa-envelope"></i>
                <a href="mailto:ameerkhan.b@zohomail.in">ameerkhan.b@zohomail.in</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPolicy;
