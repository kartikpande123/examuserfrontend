import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import image from "../Images/LOGO.jpg";
import API_BASE_URL from "./ApiConfig";

const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [hallTicketGenerated, setHallTicketGenerated] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  // Super User States
  const [showSuperUserCheck, setShowSuperUserCheck] = useState(false);
  const [superUserId, setSuperUserId] = useState('');
  const [superUserValidating, setSuperUserValidating] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [superUserDetails, setSuperUserDetails] = useState(null);

  // Ensure formData exists and normalize examDate
  const formData = location.state || {};
  formData.examDate = Array.isArray(formData.examDate) ? formData.examDate[0] : formData.examDate;

  // Check if exam is free
  const isFreeExam = !formData.examPrice || parseInt(formData.examPrice) === 0;

  useEffect(() => {
    // Automatically generate hall ticket after payment/registration is completed
    if (paymentCompleted && !hallTicketGenerated && !loading) {
      const timer = setTimeout(() => {
        handleCreateHallticket();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [paymentCompleted, hallTicketGenerated, loading]);

  if (!formData.exam) {
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

5. Technical Issues During Examination
• In the event of any technical issues, system errors, or code-related problems during the examination, the affected results will not be considered valid.
• Candidates affected by technical issues will receive a full refund of their examination fees.
• Refunds will be processed within 7-10 business days through the original payment method.
• This policy ensures fair treatment when technical difficulties impact exam performance.

6. Fees and Payments
• Exam fees must be paid in full before registration is considered complete.
• Fees are non-refundable unless stated otherwise.

7. Website Usage Restrictions
• Users may not use the website for any illegal or unauthorized purpose.
• Users must not attempt to harm, disrupt, or exploit the website's security or functionality.

8. Intellectual Property
• All content on the website, including text, images, logos, and software, is the intellectual property of ARN Private Exam Conduct.
• Unauthorized reproduction or distribution of any content is prohibited.

9. Limitation of Liability
• ARN Private Exam Conduct is not liable for any technical issues, loss of data, or other interruptions during the exam.

10. Termination of Services
• We reserve the right to suspend or terminate user accounts for violations of these terms.

11. Amendments
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

  // Super User Modal - Fixed version
  const SuperUserModal = () => {
    const [localSuperUserId, setLocalSuperUserId] = useState(superUserId);
    const [localError, setLocalError] = useState(error);

    const handleInputChange = (e) => {
      setLocalSuperUserId(e.target.value);
      setLocalError(null); // Clear error when user types
    };

    const handleVerify = async () => {
      if (!localSuperUserId.trim()) {
        setLocalError('Please enter user ID');
        return;
      }

      setSuperUserValidating(true);
      setLocalError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/super-user-all`);
        
        if (response.data.success && response.data.purchasers) {
          // Find user by user ID
          const user = response.data.purchasers.find(
            purchaser => purchaser.userId === localSuperUserId.trim()
          );

          if (!user) {
            setLocalError('User ID not found in super user list');
            setSuperUserValidating(false);
            return;
          }

          // Check if user has active subscription
          if (!user.hasActiveSubscription) {
            setLocalError('Your super user subscription has expired');
            setSuperUserValidating(false);
            return;
          }

          // Check expiry date
          const expiryDate = new Date(user.latestExpiry);
          const currentDate = new Date();

          if (expiryDate < currentDate) {
            setLocalError('Your super user subscription has expired');
            setSuperUserValidating(false);
            return;
          }

          // Update parent component state
          setSuperUserId(localSuperUserId);
          setIsSuperUser(true);
          setSuperUserDetails({
            userId: user.userId,
            name: user.userDetails.name,
            phoneNo: user.userDetails.phoneNo,
            expiryDate: user.latestExpiry
          });
          setShowSuperUserCheck(false);
          
          // Show success message
          alert(`Super User Verified!\nName: ${user.userDetails.name}\nValid Until: ${expiryDate.toLocaleDateString()}`);
          
        } else {
          setLocalError('Failed to fetch super user data');
        }
      } catch (error) {
        console.error('Super user validation error:', error);
        setLocalError('Failed to validate super user. Please try again.');
      } finally {
        setSuperUserValidating(false);
      }
    };

    const handleClose = () => {
      setShowSuperUserCheck(false);
      setLocalSuperUserId('');
      setLocalError(null);
      setError(null);
    };

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">Super User Verification</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {localError && (
                <div className="alert alert-danger" role="alert">
                  {localError}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="superUserId" className="form-label">
                  Enter Your User ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="superUserId"
                  value={localSuperUserId}
                  onChange={handleInputChange}
                  placeholder="Enter your super user ID"
                  disabled={superUserValidating}
                  autoComplete="off"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleVerify();
                    }
                  }}
                />
                <small className="text-muted">
                  Enter the user ID associated with your super user account
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={superUserValidating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleVerify}
                disabled={superUserValidating || !localSuperUserId.trim()}
              >
                {superUserValidating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Validating...
                  </>
                ) : (
                  'Verify Super User'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleOpenSuperUserCheck = () => {
    setError(null); // Clear any previous errors
    setShowSuperUserCheck(true);
  };

  const PolicyModal = () => {
    const modalContentRef = React.useRef(null);

    const handleCheckboxChange = (e) => {
      e.preventDefault();
      setPolicyAccepted(e.target.checked);
    };

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ maxWidth: '800px' }}>
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
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-primary">Cancellation Policy</h6>
                  <button className="btn btn-sm btn-outline-primary" onClick={downloadCancellationPolicy}>
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

              <div className="p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-primary">Terms and Conditions & Privacy Policy</h6>
                  <button className="btn btn-sm btn-outline-primary" onClick={downloadTermsAndConditions}>
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
                        if (isSuperUser || isFreeExam) {
                          handleFreeRegistration();
                        } else {
                          handlePayment();
                        }
                      }}
                    >
                      {isSuperUser || isFreeExam ? 'Complete Registration' : 'Proceed to Payment'}
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

    // Add payment details based on registration type
    if (isSuperUser) {
      // For super users
      formDataToSend.append('paymentId', 'SUPER_USER');
      formDataToSend.append('orderId', `SUPER_${superUserDetails.userId}_${Date.now()}`);
      formDataToSend.append('paymentAmount', '0');
      formDataToSend.append('paymentDate', new Date().toISOString());
      formDataToSend.append('superUserId', superUserDetails.userId);
      formDataToSend.append('superUserPhone', superUserDetails.phoneNo);
    } else if (paymentDetails) {
      // For paid exams
      formDataToSend.append('paymentId', paymentDetails.paymentId);
      formDataToSend.append('orderId', paymentDetails.orderId);
      formDataToSend.append('paymentAmount', paymentDetails.amount);
      formDataToSend.append('paymentDate', paymentDetails.date);
    } else if (isFreeExam) {
      // For free exams
      formDataToSend.append('paymentId', 'FREE_EXAM');
      formDataToSend.append('orderId', `FREE_${Date.now()}`);
      formDataToSend.append('paymentAmount', '0');
      formDataToSend.append('paymentDate', new Date().toISOString());
    }

    return formDataToSend;
  };

  // Handle free exam registration (also used for super users)
  const handleFreeRegistration = async () => {
    try {
      setPaymentProcessing(true);
      setError(null);

      // Set payment details based on user type
      if (isSuperUser) {
        setPaymentDetails({
          paymentId: 'SUPER_USER',
          orderId: `SUPER_${superUserDetails.userId}_${Date.now()}`,
          amount: '0',
          date: new Date().toISOString()
        });
      } else {
        setPaymentDetails({
          paymentId: 'FREE_EXAM',
          orderId: `FREE_${Date.now()}`,
          amount: '0',
          date: new Date().toISOString()
        });
      }

      // Mark as completed to trigger hall ticket generation
      setPaymentCompleted(true);
      setPaymentProcessing(false);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to complete registration');
      setPaymentProcessing(false);
    }
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

      setPaymentDetails({
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        amount: formData.examPrice,
        date: new Date().toISOString()
      });

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
        key: "rzp_live_bvTvgAdltDUW4O",
        amount: parseInt(formData.examPrice) * 100,
        currency: "INR",
        name: "ARN Study Academy",
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
            setError(null);
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

  const handleGenerateInvoice = () => {
    try {
      if (!paymentDetails) {
        setError('Payment details not found. Please try again.');
        return;
      }

      // Skip invoice generation for free exams and super users
      if (isFreeExam || isSuperUser) {
        alert('No invoice is generated for free registrations.');
        return;
      }
  
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
  
      pdf.setFillColor(0, 82, 165);
      pdf.rect(0, 0, 210, 15, 'F');
  
      pdf.addImage(image, 'JPEG', 20, 20, 40, 40);
  
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Karnataka Ayan Wholesale Supply Enterprises', 70, 30);
  
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Karnataka India 580011', 70, 37);
      pdf.text('Phone: +91 6360785195', 70, 44);
      pdf.text('Email: Jubedakbar@gmail.com', 70, 51);
      pdf.text('GSTIN: 29BXYPN0096F1ZS', 70, 58);
  
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(65, 65, 80, 15, 3, 3, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(0, 82, 165);
      pdf.text('INVOICE', 105, 77, { align: 'center' });
  
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 82, 165);
      pdf.line(20, 85, 190, 85);
  
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
  
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Number:', 20, 95);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`INV-${paymentDetails.paymentId.substring(0, 8)}`, 60, 95);
  
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', 120, 95);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleDateString('en-IN'), 135, 95);
  
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment ID:', 20, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(paymentDetails.paymentId, 60, 102);
  
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order ID:', 20, 109);
      pdf.setFont('helvetica', 'normal');
      pdf.text(paymentDetails.orderId, 60, 109);
  
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 120, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.candidateName || 'N/A', 120, 109);
      pdf.text(formData.email || 'N/A', 120, 116);
      pdf.text(formData.phone || 'N/A', 120, 123);
      pdf.text(`${formData.district || 'N/A'}, ${formData.state || 'N/A'}`, 120, 130);
      pdf.text(`${formData.pincode || 'N/A'}`, 120, 137);
  
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 82, 165);
      pdf.setFillColor(230, 240, 255);
      pdf.roundedRect(20, 144, 170, 10, 2, 2, 'F');
      pdf.text('Note: The amount shown below is inclusive of 18% GST.', 25, 151);
  
      pdf.setFillColor(0, 82, 165);
      pdf.rect(20, 160, 170, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Description', 25, 167);
      pdf.text('Amount (INR)', 160, 167, { align: 'center' });
  
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
  
      let currentY = 180;
  
      const examName = formData.exam;
      const examPrice = formData.examPrice?.toString() || '0';
  
      if (examName.length > 30) {
        const firstLine = examName.substring(0, 30);
        const secondLine = examName.substring(30);
  
        pdf.text(`Exam Registration: ${firstLine}`, 25, currentY);
        pdf.text(`${secondLine}`, 25, currentY + 7);
        pdf.text(`₹ ${examPrice}`, 160, currentY, { align: 'center' });
  
        currentY += 14;
      } else {
        pdf.text(`Exam Registration: ${examName}`, 25, currentY);
        pdf.text(`₹ ${examPrice}`, 160, currentY, { align: 'center' });
  
        currentY += 7;
      }
  
      pdf.text(`Exam Date: ${formData.examDate}`, 25, currentY);
      currentY += 7;
      pdf.text(`Time: ${formData.examStartTime} to ${formData.examEndTime}`, 25, currentY);
      currentY += 10;
  
      pdf.setFillColor(0, 82, 165);
      pdf.rect(120, currentY + 10, 70, 15, 'F');
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, currentY + 5, 190, currentY + 5);
  
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Total Amount:', 125, currentY + 20);
      pdf.setFontSize(12);
      pdf.text(`INR ${examPrice}`, 180, currentY + 20, { align: 'right' });
  
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, 265, 190, 265);
  
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text('Thank you for your payment. This is a computer-generated invoice.', 105, 272, { align: 'center' });
      pdf.text('For any queries, please contact +91 6360785195 or +91 9482759409', 105, 279, { align: 'center' });
      pdf.text('You can reach us through the Help section as well.', 105, 286, { align: 'center' });
  
      const filename = `Invoice_${formData.candidateName || 'Candidate'}_${paymentDetails.paymentId?.substring(0, 6)}.pdf`;
      pdf.save(filename);
  
      setInvoiceGenerated(true);
    } catch (error) {
      console.error('Error generating invoice:', error);
      setError('Failed to generate invoice. Please try again.');
    }
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
  
      const registrationResponse = await axios.post(
        `${API_BASE_URL}/api/register`,
        formDataToSend,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000 
        }
      );
  
      if (!registrationResponse.data.success) {
        throw new Error(registrationResponse.data.error || 'Registration failed');
      }
  
      const response = await axios.get(`${API_BASE_URL}/api/latest-candidate`);
      const candidate = response.data.candidate;
  
      if (!candidate) {
        throw new Error('Failed to fetch candidate details');
      }
  
      setRegistrationNumber(candidate.registrationNumber);
  
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
  
      pdf.addImage(image, 'JPEG', 20, 10, 30, 30);
  
      pdf.setFillColor(0, 123, 255);
      pdf.rect(0, 0, 210, 8, 'F');
  
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text('ARN STUDY ACADEMY', 60, 25);
      pdf.setFontSize(16);
      pdf.text('HALL TICKET', 85, 35);
  
      pdf.setLineWidth(0.5);
      pdf.line(20, 40, 190, 40);
  
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, 45, 170, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Registration ID: ${candidate.registrationNumber}`, 25, 51);
  
      const examDate = new Date(candidate.examDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
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
        pdf.text(value || '', 80, yPosition); 
        yPosition += 10;
      });
  
      if (candidate.photoUrl) {
        try {
          pdf.addImage(candidate.photoUrl, 'JPEG', 140, 60, 35, 45);
          pdf.rect(140, 60, 35, 45);
        } catch (error) {
          console.error('Error adding photo to PDF:', error);
        }
      }
  
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('IMPORTANT INSTRUCTIONS', 25, yPosition);
  
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
  
      const instructions = [
        "1. Registration must be completed at least 15 minutes prior to the exam.",
        "2. Participants must stay logged in and avoid leaving the platform until the exam begins.",
        "3. Registration ID and Hall Ticket are mandatory for the exam.",
        "4. Ensure a stable internet connection throughout the exam, with at least 300 MB of data available.",
        "5. Once the exam starts, entry will not be granted.",
        "6. The Registration ID is valid only for the selected exams.",
        "7. Only attempted answers will be considered after the exam ends.",
        "8. Result Status Rules:",
        "   - Attempted: Displayed if the user completes and submits all questions in the exam.",
        "   - Network Error: Displayed if any of the following occurs:",
        "      * Interruption from a mobile call.",
        "      * Exiting and reentering the exam tab.",
        "      * Insufficient or exhausted mobile data.",
        "      * Searching for questions on external platforms (e.g., Google).",
        "      * Turning off the web camera during the session.",
        "   - Not Attended: Displayed if the user does not attempt the exam at all."
      ];
  
      instructions.forEach(instruction => {
        pdf.text('• ' + instruction, 25, yPosition);
        yPosition += 7;
      });
  
      pdf.save(`${candidate.candidateName}_HallTicket.pdf`);
      
      setHallTicketGenerated(true);
      alert('Hall ticket has been generated and downloaded successfully!');
  
    } catch (error) {
      console.error('Error generating hall ticket:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError(error.response.data.error || 'Invalid registration data');
            break;
          case 409:
            setError('You have already registered for this exam.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(error.message || 'Failed to create hall ticket');
        }
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Check your internet connection.');
      } else {
        setError(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            {isSuperUser ? 'Super User Registration' : isFreeExam ? 'Free Exam Registration' : 'Payment Gateway'}
          </h3>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {isSuperUser && (
            <div className="alert alert-success mb-4">
              <h5 className="alert-heading">✓ Super User Verified</h5>
              <p className="mb-0">
                <strong>User ID:</strong> {superUserDetails.userId}<br />
                <strong>Name:</strong> {superUserDetails.name}<br />
                <strong>Phone:</strong> {superUserDetails.phoneNo}<br />
                <strong>Valid Until:</strong> {new Date(superUserDetails.expiryDate).toLocaleDateString()}<br />
                <span className="badge bg-success mt-2">Payment Bypass Activated</span>
              </p>
            </div>
          )}

          <div className="alert alert-warning">
            <h5 className="alert-heading">Having trouble downloading your hall ticket?</h5>
            <p className="mb-0">
              <ul className="mb-0">
                <li>Contact us at +91 6360785195, +91 9482759409</li>
                <li>Keep your payment screenshot ready when seeking help</li>
                <li>Visit our help section for additional support</li>
              </ul>
            </p>
          </div>

          <div className="row mb-4">
            <div className="col-md-6 offset-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Exam {isSuperUser || isFreeExam ? 'Registration' : 'Payment'} Details</h5>
                  <p className="card-text">
                    <strong>Exam:</strong> {formData.exam}<br />
                    <strong>Exam Date:</strong> {formData.examDate}<br />
                    <strong>Exam Time:</strong> {formData.examStartTime} to {formData.examEndTime}<br />
                    <strong>Candidate Name:</strong> {formData.candidateName}<br />
                    {isSuperUser ? (
                      <span className="badge bg-success fs-6 mt-2">SUPER USER - NO PAYMENT REQUIRED</span>
                    ) : isFreeExam ? (
                      <span className="badge bg-success fs-6 mt-2">FREE EXAM</span>
                    ) : (
                      <><strong>Amount:</strong> ₹{formData.examPrice}</>
                    )}
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
              <div>
                {/* Super User Check Button - Only show for paid exams */}
                {!isFreeExam && !isSuperUser && (
                  <div className="mb-3">
                    <button
                      onClick={handleOpenSuperUserCheck}
                      className="btn btn-success btn-sm"
                      disabled={paymentProcessing || loading}
                    >
                      <i className="bi bi-star-fill me-2"></i>
                      Are you a Super User? Click here
                    </button>
                  </div>
                )}

                <button
                  onClick={initiatePaymentProcess}
                  className="btn btn-primary btn-lg mb-3"
                  disabled={paymentProcessing || loading}
                >
                  {paymentProcessing ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isSuperUser || isFreeExam ? 'Processing Registration...' : 'Processing Payment...'}
                    </span>
                  ) : (
                    isSuperUser || isFreeExam ? 'Complete Registration' : 'Proceed to Payment'
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="alert alert-success mb-3">
                  {isSuperUser ? 'Super User registration completed successfully!' : 
                   isFreeExam ? 'Registration completed successfully!' : 
                   'Payment completed successfully!'}
                </div>
                {!hallTicketGenerated ? (
                  <div className="text-center mb-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Generating hall ticket...</span>
                    </div>
                    <p className="mt-2">Generating your hall ticket automatically...</p>
                  </div>
                ) : (
                  <div className="alert alert-info mb-3">
                    <h5 className="alert-heading">Hall Ticket Generated Successfully!</h5>
                    <p>Your hall ticket has been automatically generated and downloaded.</p>
                  </div>
                )}
                {!isFreeExam && !isSuperUser && (
                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                    <button
                      onClick={handleGenerateInvoice}
                      className="btn btn-primary btn-lg"
                      disabled={loading || !paymentDetails}
                    >
                      {invoiceGenerated ? 'Download Invoice Again' : 'Download Invoice'}
                    </button>
                  </div>
                )}
                {!isFreeExam && !isSuperUser && !invoiceGenerated && (
                  <div className="alert alert-warning mt-3">
                    <strong>Important:</strong> If you don't download your invoice now, you won't be able to access it in the future. Please make sure to download and save it.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPolicyModal && <PolicyModal />}
      {showSuperUserCheck && <SuperUserModal />}
    </div>
  );
};

export default PaymentGateway;