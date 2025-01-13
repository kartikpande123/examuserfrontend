import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import image from "../Images/LOGO.jpg";
import API_BASE_URL from "./ApiConifg";

const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [hallTicketGenerated, setHallTicketGenerated] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Ensure formData exists and normalize examDate
  const formData = location.state || {};
  formData.examDate = Array.isArray(formData.examDate) ? formData.examDate[0] : formData.examDate;

  if (!formData.exam || !formData.examPrice) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          Invalid form data. Please go back and try again.
        </div>
      </div>
    );
  }

  const cancellationPolicy = `Cancellation Policy for ARN Private Exam Conduct

1. Eligibility for Cancellation
• Exam registration cancellations are allowed only if requested within a specified timeframe, typically 2 days before the scheduled exam date.
• Cancellation requests after the specified timeframe will not be entertained, except in extraordinary circumstances at our sole discretion.

2. Process for Cancellation
• Users must submit a written request for cancellation via email or the designated cancellation form available on our website.
• Cancellation requests must include the user's name, registration ID, and reason for cancellation.

3. Refund Policy
• Full refunds: If the cancellation request is made within 2 days after registration or before the cancellation deadline.
• Partial refunds: If allowed, these will deduct processing fees (e.g., payment gateway charges or administrative costs).
• No refunds: For cancellation requests made after the specified deadline or for users who fail to appear for the exam.

4. Non-Refundable Fees
• Certain fees, such as administrative charges or late registration fees, are non-refundable under all circumstances.

5. Exam Rescheduling
• Instead of cancellation, users may request to reschedule their exam to a later date if the option is available.
• Rescheduling requests may incur an additional fee.

6. No-Show Policy
• Users who do not appear for the exam without prior notice or approval will forfeit the entire registration fee.

7. Cancellation Due to Technical Issues
• If the exam is canceled or postponed by ARN Private Exam Conduct due to technical or operational issues, users will be given the option to:
  - Reschedule the exam at no extra cost, or
  - Receive a full refund of the registration fee.

8. Extraordinary Circumstances
• In cases of emergencies such as natural disasters, severe illness (with medical proof), or other unforeseen events, cancellation or rescheduling may be allowed on a case-by-case basis.

9. Notification of Changes
• ARN Private Exam Conduct reserves the right to modify this cancellation policy at any time.
• Changes will be communicated through our website or email.

10. Contact for Cancellation Requests
• Users can contact us at +91 6360785195 for queries or to initiate a cancellation request.`;

const termsAndConditions = `Terms and Conditions

1. Acceptance of Terms
• By accessing or using our website, you agree to abide by these Terms and Conditions.
• If you do not agree to these terms, you may not use the services provided by ARN Private Exam Conduct.

2. Eligibility
• Users must be at least 18 years old or have parental/guardian consent to register and participate in exams.
• Accurate and truthful information must be provided during registration.

3. User Account Responsibilities
• Users are responsible for maintaining the confidentiality of their account credentials.
• Unauthorized access to or use of your account must be reported to us immediately.

4. Exam Conduct Guidelines
• Users must adhere to all instructions provided during the exam.
• Cheating, plagiarism, or any other form of malpractice is strictly prohibited and will result in disqualification.

5. Fees and Payments
• Exam fees must be paid in full before registration is considered complete.
• Fees are non-refundable unless stated otherwise.

6. Website Usage Restrictions
• Users may not use the website for any illegal or unauthorized purpose.
• Users must not attempt to harm, disrupt, or exploit the website's security or functionality.

7. Intellectual Property
• All content on the website, including text, images, logos, and software, is the intellectual property of ARN Private Exam Conduct.
• Unauthorized reproduction or distribution of any content is prohibited.

8. Limitation of Liability
• ARN Private Exam Conduct is not liable for any technical issues, loss of data, or other interruptions during the exam.

9. Termination of Services
• We reserve the right to suspend or terminate user accounts for violations of these terms.

10. Amendments
• We may update these terms periodically. Users will be notified of significant changes, and continued use of the website signifies acceptance of the updated terms.

Privacy Policy

1. Information We Collect
• Personal Information: Name, email address, phone number, payment details, etc.
• Exam Data: Performance, answers, and scores.
• Technical Information: IP address, browser type, and cookies for website functionality.

2. How We Use Your Information
• To register and authenticate users.
• To conduct and manage online exams.
• To communicate updates, results, and notifications.

3. Data Sharing
• We do not share your personal information with third parties, except as required by law or with your consent.

4. Data Security
• We employ industry-standard security measures to protect your data.
• While we strive to safeguard your information, no system is completely secure.

5. User Rights
• Access: Users can request access to their personal data.
• Rectification: Users can update or correct their data.
• Deletion: Users may request the deletion of their data, subject to legal and operational requirements.

6. Third-Party Services
• We may use third-party payment gateways or analytics tools. These services have their own privacy policies.

7. Retention of Data
• User data is retained as long as necessary for operational, legal, or regulatory purposes.

8. Changes to the Privacy Policy
• We may update this policy periodically. Users will be notified of significant changes.`;

  const downloadCancellationPolicy = () => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Cancellation Policy - ARN Private Exam Conduct", 20, 20);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const splitText = pdf.splitTextToSize(cancellationPolicy, 170);
    pdf.text(splitText, 20, 40);
    
    pdf.save("cancellation_policy.pdf");
  };

  const downloadTermsAndConditions = () => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Terms and Conditions & Privacy Policy", 20, 20);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const splitText = pdf.splitTextToSize(termsAndConditions, 170);
    pdf.text(splitText, 20, 40);
    
    pdf.save("terms_and_conditions.pdf");
  };

  const PolicyModal = () => {
    const modalContentRef = React.useRef(null);
  
    // Function to handle checkbox change without scrolling
    const handleCheckboxChange = (e) => {
      e.preventDefault(); // Prevent default behavior that might cause scrolling
      setPolicyAccepted(e.target.checked);
    };
  
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <div 
          className="modal-dialog modal-lg modal-dialog-scrollable" 
          style={{ maxWidth: '800px' }}
        >
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white border-0">
              <h5 className="modal-title">Policies and Terms</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowPolicyModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div 
              className="modal-body" 
              ref={modalContentRef}
              style={{ 
                maxHeight: '70vh',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#6c757d transparent'
              }}
            >
              {/* Cancellation Policy Section */}
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-primary">Cancellation Policy</h6>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={downloadCancellationPolicy}
                  >
                    <i className="bi bi-download me-1"></i>
                    Download PDF
                  </button>
                </div>
                <div className="policy-content" style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {cancellationPolicy}
                  </pre>
                </div>
              </div>
  
              {/* Terms and Conditions Section */}
              <div className="p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-primary">Terms and Conditions & Privacy Policy</h6>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={downloadTermsAndConditions}
                  >
                    <i className="bi bi-download me-1"></i>
                    Download PDF
                  </button>
                </div>
                <div className="policy-content" style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {termsAndConditions}
                  </pre>
                </div>
              </div>
            </div>
  
            {/* Fixed Footer */}
            <div className="modal-footer border-top bg-light" style={{ position: 'sticky', bottom: 0 }}>
              <div className="container-fluid">
                <div className="row align-items-center">
                  <div className="col-12 col-md-7 mb-2 mb-md-0">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="acceptPolicy"
                        checked={policyAccepted}
                        onChange={handleCheckboxChange}
                      />
                      <label className="form-check-label" htmlFor="acceptPolicy">
                        I have read and agree to all policies and terms
                      </label>
                    </div>
                  </div>
                  <div className="col-12 col-md-5 text-md-end">
                    <button 
                      type="button" 
                      className="btn btn-secondary me-2" 
                      onClick={() => setShowPolicyModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!policyAccepted}
                      onClick={() => {
                        setShowPolicyModal(false);
                        handlePayment();
                      }}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  const prepareRegistrationData = () => {
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === 'photo') {
        formDataToSend.append('photo', formData[key], formData[key].name);
      } else if (key === 'examDate') {
        const examDate = Array.isArray(formData.examDate) ? formData.examDate[0] : formData.examDate;
        formDataToSend.append('examDate', examDate);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    return formDataToSend;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    try {
      const orderData = {
        amount: parseInt(formData.examPrice),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          examId: formData.exam,
          candidateName: formData.candidateName,
          email: formData.email || 'NA',
          phone: formData.phone
        }
      };

      const { data } = await axios.post(`${API_BASE_URL}/api/create-order`, orderData);

      if (!data.success || !data.order || !data.order.id) {
        throw new Error(data.error || 'Invalid order response');
      }

      return data.order;
    } catch (error) {
      console.error('Order creation error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to create payment order');
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/verify-payment`,
        {
          orderId: paymentResponse.razorpay_order_id,
          paymentId: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Payment verification failed. Please contact support.');
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentProcessing(true);
      setError(null);

      await loadRazorpayScript();
      const order = await createOrder();

      const options = {
        key: "rzp_test_VdsKKjJWXYkYWD",
        amount: parseInt(formData.examPrice) * 100,
        currency: "INR",
        name: "Ayan Study Academy",
        description: `Exam Registration for ${formData.exam}`,
        order_id: order.id,
        prefill: {
          name: formData.candidateName,
          email: formData.email || '',
          contact: formData.phone
        },
        theme: {
          color: "#3399cc"
        },
        handler: async function (response) {
          try {
            await verifyPayment(response);
            setPaymentCompleted(true);
          } catch (error) {
            setError(error.message);
            setPaymentProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (resp) {
        setError(`Payment failed: ${resp.error.description}`);
        setPaymentProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment');
      setPaymentProcessing(false);
    }
  };

  const initiatePaymentProcess = () => {
    setShowPolicyModal(true);
  };

  const handleCreateHallticket = async () => {
    if (hallTicketGenerated) {
      setError('Hall ticket has already been generated. Please check your downloads.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = prepareRegistrationData();

      // Register candidate
      const registrationResponse = await axios.post(
        `${API_BASE_URL}/api/register`, 
        formDataToSend, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (!registrationResponse.data.success) {
        throw new Error(registrationResponse.data.error || 'Registration failed');
      }

      // Fetch latest candidate data
      const response = await axios.get(`${API_BASE_URL}/api/latest-candidate`);
      const candidate = response.data.candidate;

      if (!candidate) {
        throw new Error('Failed to fetch candidate details');
      }

      // Set registration number and show alert
      setRegistrationNumber(candidate.registrationNumber);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add logo with specific dimensions
      pdf.addImage(image, 'JPEG', 20, 10, 30, 30);

      // Header styling
      pdf.setFillColor(0, 123, 255);
      pdf.rect(0, 0, 210, 8, 'F');

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text('AYAN STUDY ACADEMY', 60, 25);

      // Subtitle
      pdf.setFontSize(16);
      pdf.text('HALL TICKET', 85, 35);

      // Add decorative line
      pdf.setLineWidth(0.5);
      pdf.line(20, 40, 190, 40);

      // Registration ID box
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, 45, 170, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Registration ID: ${candidate.registrationNumber}`, 25, 51);

      // Format the date
      const examDate = new Date(candidate.examDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Main details
      const details = [
        { label: 'Candidate Name', value: candidate.candidateName },
        { label: 'Date of Birth', value: candidate.dob },
        { label: 'Gender', value: candidate.gender },
        { label: 'District', value: candidate.district },
        { label: 'State', value: candidate.state },
        { label: 'Phone Number', value: candidate.phone },
        { label: 'Exam', value: candidate.exam },
        { label: 'Exam Date', value: examDate },
        { label: 'Exam Start Time', value: formatTime(candidate.examStartTime) },
        { label: 'Exam End Time', value: formatTime(candidate.examEndTime) }
      ];

      let yPosition = 65;
      details.forEach(({ label, value }) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${label}:`, 25, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value || '', 80, yPosition);yPosition += 10;
      });

      // Add candidate photo if exists
      if (candidate.photoUrl) {
        try {
          pdf.addImage(candidate.photoUrl, 'JPEG', 140, 60, 35, 45);
          pdf.rect(140, 60, 35, 45);
        } catch (error) {
          console.error('Error adding photo to PDF:', error);
          // Continue without the photo if there's an error
        }
      }

      // Instructions section
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('IMPORTANT INSTRUCTIONS', 25, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const instructions = [
        'Login at least 15 minutes before the examination time.',
        'Registration ID and Hall Ticket are mandatory for the exam.',
        'Ensure stable internet connection throughout the exam.',
        'No electronic devices are allowed during the examination.',
        'Maintain proper webcam positioning throughout the exam.',
        'Any form of malpractice will lead to immediate disqualification.',
        'Save your Registration ID for future reference.',
        'Once the exam starts, entry will not be granted.',
        'The Registration ID is valid only for the selected exams.',
        'Register at least 15 minutes before the exam starts and wait for the exam to begin.',
        "Only attempted answers will be considered after the exam ends."
      ];

      instructions.forEach(instruction => {
        pdf.text('• ' + instruction, 25, yPosition);
        yPosition += 7;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.text('This is a computer-generated document. No signature is required.', 25, 280);

      pdf.save(`${candidate.candidateName}_HallTicket.pdf`);
      setHallTicketGenerated(true);
      alert('Hall ticket has been generated and downloaded successfully!');

    } catch (error) {
      console.error('Error generating hall ticket:', error);
      if (error.response?.data?.error === 'Duplicate registration') {
        setError('You have already registered for this exam.');
      } else {
        setError(error.message || 'Failed to create hall ticket. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Payment Gateway</h3>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row mb-4">
            <div className="col-md-6 offset-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Exam Payment Details</h5>
                  <p className="card-text">
                    <strong>Exam:</strong> {formData.exam}<br />
                    <strong>Exam Date:</strong> {formData.examDate}<br />
                    <strong>Exam Time:</strong> {formData.examStartTime} to {formData.examEndTime}<br />
                    <strong>Candidate Name:</strong> {formData.candidateName}<br />
                    <strong>Amount:</strong> ₹{formData.examPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {registrationNumber && (
            <div className="alert alert-info mb-4">
              <h5 className="alert-heading">Important! Save Your Registration Number</h5>
              <p className="mb-0">Your Registration Number: <strong>{registrationNumber}</strong></p>
              <hr />
              <p className="mb-0 text-danger">Please keep this number safe. You will need it to access your exam and for any future communications.</p>
            </div>
          )}

          <div className="text-center">
            {!paymentCompleted ? (
              <button
                onClick={initiatePaymentProcess}
                className="btn btn-primary btn-lg mb-3"
                disabled={paymentProcessing || loading}
              >
                {paymentProcessing ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing Payment...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            ) : (
              <div>
                <div className="alert alert-success mb-3">
                  Payment completed successfully!
                </div>
                <button
                  onClick={handleCreateHallticket}
                  className="btn btn-success btn-lg"
                  disabled={loading || hallTicketGenerated}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating Hall Ticket...
                    </span>
                  ) : hallTicketGenerated ? (
                    'Hall Ticket Already Generated'
                  ) : (
                    'Create and Download Hall Ticket'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPolicyModal && <PolicyModal />}
    </div>
  );
};

export default PaymentGateway;