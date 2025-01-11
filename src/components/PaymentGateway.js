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

  // Modified time formatting function to preserve original format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  // Updated registration data preparation
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
        { label: 'Exam Date', value: examDate }, // Using formatted date
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
                onClick={handlePayment}
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
    </div>
  );
};

export default PaymentGateway;