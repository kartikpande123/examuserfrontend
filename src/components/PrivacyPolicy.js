import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div
      className="container my-5"
      style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}
    >
      <h1
        className="text-center mb-4"
        style={{
          color: '#007BFF',
          fontWeight: 'bold',
          borderBottom: '3px solid #007BFF',
          display: 'inline-block',
          paddingBottom: '8px',
        }}
      >
        Privacy Policy
      </h1>
      <div
        className="card shadow-lg p-4"
        style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          border: '1px solid #ddd',
        }}
      >
        <ol style={{ lineHeight: '2', paddingLeft: '20px' }}>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Information We Collect</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Personal Information: Name, email address, phone number, payment details, etc. <br />
              Exam Data: Performance, answers, and scores. <br />
              Technical Information: IP address, browser type, and cookies for website functionality.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>How We Use Your Information</strong>
            <p style={{ fontSize: '1.1rem' }}>
              To register and authenticate users. <br />
              To conduct and manage online exams. <br />
              To communicate updates, results, and notifications.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Data Sharing</strong>
            <p style={{ fontSize: '1.1rem' }}>
              We do not share your personal information with third parties, except as required by law or with your consent.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Data Security</strong>
            <p style={{ fontSize: '1.1rem' }}>
              We employ industry-standard security measures to protect your data. While we strive to safeguard your information, no system is completely secure.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>User Rights</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Access: Users can request access to their personal data. <br />
              Rectification: Users can update or correct their data. <br />
              Deletion: Users may request the deletion of their data, subject to legal and operational requirements.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Third-Party Services</strong>
            <p style={{ fontSize: '1.1rem' }}>
              We may use third-party payment gateways or analytics tools. These services have their own privacy policies.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Retention of Data</strong>
            <p style={{ fontSize: '1.1rem' }}>
              User data is retained as long as necessary for operational, legal, or regulatory purposes.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Changes to the Privacy Policy</strong>
            <p style={{ fontSize: '1.1rem' }}>
              We may update this policy periodically. Users will be notified of significant changes.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
