import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div
      className="container my-5"
      style={{
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        maxWidth: '900px',
        margin: '0 auto'
      }}
    >
      <h1
        className="text-center mb-4"
        style={{
          color: '#007BFF',
          fontWeight: 'bold',
          borderBottom: '3px solid #007BFF',
          display: 'inline-block',
          paddingBottom: '8px'
        }}
      >
        Privacy Policy – ARN Student Portal
      </h1>

      <div
        className="card shadow-lg p-4"
        style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          border: '1px solid #ddd'
        }}
      >
        <p style={{ fontSize: '1.05rem' }}>
          <strong>Company:</strong> KARNATAKA AYAN WHOLESALE SUPPLY ENTERPRICES <br />
          <strong>Developer:</strong> AKBARSAB NADAF <br />
          <strong>App Name:</strong> ARN Student Portal <br />
          <strong>Country:</strong> India <br />
          <strong>Contact Email:</strong> jubedakbar@gmail.com
        </p>

        <ol style={{ lineHeight: '1.9', paddingLeft: '20px' }}>
          <li>
            <strong>Information We Collect</strong>
            <p>
              <b>Personal Information:</b> Name, email address, phone number, and payment details when users register or purchase exams. <br />
              <b>Exam Data:</b> Answers, scores, and exam performance. <br />
              <b>Technical Information:</b> Device type, IP address, OS version, and app usage data for security and performance.
            </p>
          </li>

          <li>
            <strong>How We Use Your Information</strong>
            <p>
              • To register and identify users <br />
              • To conduct and manage online exams <br />
              • To process payments securely <br />
              • To send exam updates, results, and notifications <br />
              • To improve app performance and user experience
            </p>
          </li>

          <li>
            <strong>Data Sharing</strong>
            <p>
              We do <b>not sell or share</b> user personal data with third parties. Data may only be shared:
              <br />• With secure payment providers (Razorpay) for transactions
              <br />• If required by law or legal authorities
            </p>
          </li>

          <li>
            <strong>Data Security</strong>
            <p>
              We use industry-standard security practices to protect your information. However, no digital platform is completely secure.
            </p>
          </li>

          <li>
            <strong>User Rights</strong>
            <p>
              Users may request:
              <br />• Access to their personal data
              <br />• Correction of incorrect data
              <br />• Deletion of their data (subject to legal requirements)
              <br />
              Requests can be sent to our contact email.
            </p>
          </li>

          <li>
            <strong>Third-Party Services</strong>
            <p>
              Our app may use trusted third-party services such as:
              <br />• Razorpay – Secure payment processing
              <br />• Analytics / Crash reporting tools (if used)
              <br />
              These services have their own privacy policies.
            </p>
          </li>

          <li>
            <strong>Data Retention</strong>
            <p>
              We retain user data only as long as necessary for exam services, legal compliance, and account records.
            </p>
          </li>

          <li>
            <strong>Children’s Privacy</strong>
            <p>
              This app is not intended for children under the age of 13. We do not knowingly collect personal data from children.
            </p>
          </li>

          <li>
            <strong>Changes to This Privacy Policy</strong>
            <p>
              We may update this Privacy Policy from time to time. Users are encouraged to review it periodically.
            </p>
          </li>

          <li>
            <strong>Contact Us</strong>
            <p>
              Email: jubedakbar@gmail.com <br />
              Developer: KARNATAKA AYAN WHOLESALE SUPPLY ENTERPRICES <br />
              App: ARN Student Portal
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
