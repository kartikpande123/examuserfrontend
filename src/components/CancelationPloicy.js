import React from 'react';

const CancellationPolicy = () => {
  return (
    <div
      className="container my-5"
      style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}
    >
      <h1
        className="text-center mb-4"
        style={{
          color: '#FF5733',
          fontWeight: 'bold',
          borderBottom: '3px solid #FF5733',
          display: 'inline-block',
          paddingBottom: '8px',
        }}
      >
        Cancellation Policy
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
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Eligibility for Cancellation</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Exam registration cancellations are allowed only if requested within a specified timeframe, typically 2 days before the scheduled exam date. <br />
              Cancellation requests after the specified timeframe will not be entertained, except in extraordinary circumstances at our sole discretion.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Process for Cancellation</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users must submit a written request for cancellation via email or the designated cancellation form available on our website. <br />
              Cancellation requests must include the user’s name, registration ID, and reason for cancellation.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Refund Policy</strong>
            <p style={{ fontSize: '1.1rem' }}>
              <strong>Full refunds:</strong> If the cancellation request is made within 2 days after registration or before the cancellation deadline. <br />
              <strong>Partial refunds:</strong> If allowed, these will deduct processing fees (e.g., payment gateway charges or administrative costs). <br />
              <strong>No refunds:</strong> For cancellation requests made after the specified deadline or for users who fail to appear for the exam.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Non-Refundable Fees</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Certain fees, such as administrative charges or late registration fees, are non-refundable under all circumstances.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Exam Rescheduling</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Instead of cancellation, users may request to reschedule their exam to a later date if the option is available. <br />
              Rescheduling requests may incur an additional fee.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>No-Show Policy</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users who do not appear for the exam without prior notice or approval will forfeit the entire registration fee.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Cancellation Due to Technical Issues</strong>
            <p style={{ fontSize: '1.1rem' }}>
              If the exam is canceled or postponed by ARN Private Exam Conduct due to technical or operational issues, users will be given the option to: <br />
              &bull; Reschedule the exam at no extra cost, or <br />
              &bull; Receive a full refund of the registration fee.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Extraordinary Circumstances</strong>
            <p style={{ fontSize: '1.1rem' }}>
              In cases of emergencies such as natural disasters, severe illness (with medical proof), or other unforeseen events, cancellation or rescheduling may be allowed on a case-by-case basis.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Notification of Changes</strong>
            <p style={{ fontSize: '1.1rem' }}>
              ARN Private Exam Conduct reserves the right to modify this cancellation policy at any time. Changes will be communicated through our website or email.
            </p>
          </li>
          <li>
            <strong style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Contact for Cancellation Requests</strong>
            <p style={{ fontSize: '1.1rem' }}>
              Users can contact us at <strong style={{ color: '#FF5733' }}>+91 6360785195</strong> for queries or to initiate a cancellation request.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default CancellationPolicy;
