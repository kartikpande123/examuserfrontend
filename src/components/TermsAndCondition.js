import React from 'react';

const TermsAndConditions = () => {
  return (
    <div
      className="container my-5"
      style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}
    >
      <h1
        className="text-center mb-4"
        style={{
          color: '#4CAF50',
          fontWeight: 'bold',
          borderBottom: '3px solid #4CAF50',
          display: 'inline-block',
          paddingBottom: '8px',
        }}
      >
        Terms and Conditions
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
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Acceptance of Terms</strong>
            <p style={{ fontSize: '1.1rem' }}>
              By accessing or using our website, you agree to abide by these Terms and Conditions. If you do not agree to these terms, you may not use the services provided by ARN Private Exam Conduct.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Eligibility</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users must be at least 18 years old or have parental/guardian consent to register and participate in exams. Accurate and truthful information must be provided during registration.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>User Account Responsibilities</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users are responsible for maintaining the confidentiality of their account credentials. Unauthorized access to or use of your account must be reported to us immediately.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Exam Conduct Guidelines</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users must adhere to all instructions provided during the exam. Cheating, plagiarism, or any other form of malpractice is strictly prohibited and will result in disqualification.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Fees and Payments</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Exam fees must be paid in full before registration is considered complete. Fees are non-refundable unless stated otherwise.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Website Usage Restrictions</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users may not use the website for any illegal or unauthorized purpose. Users must not attempt to harm, disrupt, or exploit the website’s security or functionality.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Intellectual Property</strong>
            <p style={{ fontSize: '1.1rem' }}>
              All content on the website, including text, images, logos, and software, is the intellectual property of ARN Private Exam Conduct. Unauthorized reproduction or distribution of any content is prohibited.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Limitation of Liability</strong>
            <p style={{ fontSize: '1.1rem' }}>
              ARN Private Exam Conduct is not liable for any technical issues, loss of data, or other interruptions during the exam.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Termination of Services</strong>
            <p style={{ fontSize: '1.1rem' }}>
              We reserve the right to suspend or terminate user accounts for violations of these terms.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Amendments</strong>
            <p style={{ fontSize: '1.1rem' }}>
              We may update these terms periodically. Users will be notified of significant changes, and continued use of the website signifies acceptance of the updated terms.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TermsAndConditions;
