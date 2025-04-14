import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Container, 
  Row, 
  Col, 
  Card, 
  Alert, 
  Spinner,
  Modal,
  Badge
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConifg';
import './ExamRegistration.css';
import logo from "../Images/LOGO.jpg"

const ExamPurchaseRegistration = () => {
  // State management
  const [stage, setStage] = useState('studentId'); 
  const [studentId, setStudentId] = useState('');
  const [existingStudentDetails, setExistingStudentDetails] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [isEditingExistingData, setIsEditingExistingData] = useState(false);
  const [showExamDetailsModal, setShowExamDetailsModal] = useState(false);
  const [purchasedStudentDetails, setPurchasedStudentDetails] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Form data for new registration
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phoneNo: '',
    email: '',
    district: '',
    state: ''
  });

  // Navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Load selected exam from navigation state
  useEffect(() => {
    if (location.state && location.state.selectedExam) {
      setSelectedExam(location.state.selectedExam);
    } else {
      navigate('/practice-tests');
    }
  }, [location.state, navigate]);

  // Calculate expiration date based on purchase date and exam duration
  const calculateExpirationDate = (purchaseDate, durationString) => {
    const duration = parseInt(durationString.split(' ')[0]);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + duration);
    return expirationDate;
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate PDF for student
  const generateStudentPDF = (studentDetails, purchaseDate) => {
    const doc = new jsPDF();

    // Calculate expiration date
    const durationDays = selectedExam.duration.split(' ')[0];
    const expiry = new Date(purchaseDate);
    expiry.setDate(expiry.getDate() + parseInt(durationDays));

    // ===== 1. Professional Header =====
    doc.setFillColor(10, 35, 66); // Dark blue
    doc.rect(0, 0, 210, 40, 'F'); // Full-width header
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ARN EXAM PRIVATE CONDUCT", 105, 25, { align: 'center' });

    // ===== 2. Student ID (Highlighted) =====
    doc.setFillColor(240, 240, 240); // Light gray background
    doc.rect(20, 50, 170, 15, 'F');
    doc.setTextColor(10, 35, 66); // Dark blue text
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`STUDENT ID: ${studentDetails.studentId}`, 105, 60, { align: 'center' });

    // ===== 3. Student Details (Clean Layout) =====
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Name: ${studentDetails.name}`, 20, 85);
    doc.text(`Age: ${studentDetails.age}`, 20, 95);
    doc.text(`Gender: ${studentDetails.gender}`, 20, 105);
    doc.text(`Contact: ${studentDetails.phoneNo}`, 20, 115);

    // ===== 4. Exam Details (Boxed Section) =====
    doc.setDrawColor(200, 200, 200); // Light gray border
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.rect(20, 130, 170, 60, 'FD');

    doc.setTextColor(10, 35, 66);
    doc.setFont("helvetica", "bold");
    doc.text("EXAM DETAILS", 30, 140);

    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(`Exam: ${selectedExam.title}`, 30, 150);
    doc.text(`Duration: ${selectedExam.duration}`, 30, 160);
    doc.text(`Purchase Date: ${formatDate(purchaseDate)}`, 30, 170);

    // Expiry Date Highlighted in Red (without separate box)
    doc.setTextColor(180, 0, 0); // Dark red text
    doc.setFont("helvetica", "bold");
    doc.text(`Expires On: ${formatDate(expiry)}`, 30, 180);

    // ===== 5. Important Notes Section =====
    doc.setDrawColor(10, 35, 66); // Dark blue border
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 205, 170, 65, 3, 3, 'FD');

    doc.setTextColor(10, 35, 66);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("IMPORTANT NOTES", 105, 215, { align: 'center' });

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const notes = [
        "Once an exam is purchased, it is non-refundable under any circumstances.",
        "With your Student ID, you may purchase any exam without completing additional forms.",
        "Access to the exam will be automatically revoked after the expiration date.",
        "All practice exams require submission of answers for all questions.",
        "For technical support or inquiries, please contact our Help Center.",
        "Ensure a stable internet connection during the exam purchase process.",
        "ARN is not responsible for access issues due to connectivity problems on your end."
    ];

    let yPos = 225;
    notes.forEach((note, index) => {
        doc.setFont("helvetica", "bold");
        doc.text("•", 25, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(note, 30, yPos);
        yPos += 7;
    });

    // ===== 6. Footer =====
    doc.setFillColor(10, 35, 66);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('© 2025/26 ARN EXAM PRIVATE CONDUCT. All rights reserved.', 105, 288, { align: 'center' });

    return doc;
};


const generateInvoicePDF = () => {
  try {
    if (!purchasedStudentDetails || !selectedExam) {
      toast.error('Purchase details not found. Cannot generate invoice.');
      return;
    }
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Payment and order IDs - use values from the payment response
    const paymentId = selectedExam.fees === 0 ? `FREE-${Date.now()}` : (paymentDetails?.paymentId || `INV-${Date.now()}`);
    const orderId = selectedExam.fees === 0 ? `FREE-ORDER-${Date.now()}` : (paymentDetails?.orderId || '');
    
    // Header background
    pdf.setFillColor(0, 82, 165);
    pdf.rect(0, 0, 210, 15, 'F');
    
    // Logo placeholder
    pdf.setFillColor(230, 230, 230);
    pdf.rect(20, 20, 40, 40, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    

    // Logo
    pdf.addImage(logo, 'JPEG', 20, 20, 40, 40);
    
    // Company details
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('ARN EXAM PRIVATE CONDUCT', 70, 30);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Karnataka India 580011', 70, 37);
    pdf.text('Phone: +91 6360785195', 70, 44);
    pdf.text('Email: support@arn.com', 70, 51);
    pdf.text('GSTIN: 29BXYPN0096F1ZS', 70, 58);
    
    // Invoice title
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(65, 65, 80, 15, 3, 3, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(0, 82, 165);
    pdf.text('INVOICE', 105, 77, { align: 'center' });
    
    // Decorative line
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 82, 165);
    pdf.line(20, 85, 190, 85);
    
    // Invoice details
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    // Check if it's a free exam
    const isFree = selectedExam.fees === 0;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice Number:', 20, 95);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`INV-${paymentId ? paymentId.substring(0, 8) : new Date().getTime().toString().substring(0, 8)}`, 60, 95);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', 120, 95);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date().toLocaleDateString('en-IN'), 135, 95);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment ID:', 20, 102);
    pdf.setFont('helvetica', 'normal');
    pdf.text(paymentId || 'FREE', 60, 102);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Order ID:', 20, 109);
    pdf.setFont('helvetica', 'normal');
    pdf.text(orderId || 'FREE-ORDER', 60, 109);
    
    // Customer details
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To:', 120, 102);
    pdf.setFont('helvetica', 'normal');
    pdf.text(purchasedStudentDetails.name || 'N/A', 120, 109);
    pdf.text(purchasedStudentDetails.email || 'N/A', 120, 116);
    pdf.text(purchasedStudentDetails.phoneNo || 'N/A', 120, 123);
    pdf.text(`${purchasedStudentDetails.district || 'N/A'}, ${purchasedStudentDetails.state || 'N/A'}`, 120, 130);
    
    // GST Note - only show for paid exams
    if (!isFree && parseFloat(selectedExam.fees) > 0) {
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 82, 165);
      pdf.setFillColor(230, 240, 255);
      pdf.roundedRect(20, 144, 170, 10, 2, 2, 'F');
      pdf.text('Note: The amount shown below is inclusive of 18% GST.', 25, 151);
    }
    
    // Table header
    pdf.setFillColor(0, 82, 165);
    pdf.rect(20, 160, 170, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Description', 25, 167);
    pdf.text('Amount (INR)', 160, 167, { align: 'center' });
    
    // Reset text color and font
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    let currentY = 180;
    
    const examTitle = selectedExam.title;
    const examPrice = selectedExam.fees?.toString() || '0';
    
    if (examTitle.length > 30) {
      const firstLine = examTitle.substring(0, 30);
      const secondLine = examTitle.substring(30);
      pdf.text(`Exam: ${firstLine}`, 25, currentY);
      pdf.text(`${secondLine}`, 25, currentY + 7);
      
      // For free exam, show "FREE" instead of price
      if (isFree || parseFloat(examPrice) === 0) {
        pdf.text('FREE', 160, currentY, { align: 'center' });
      } else {
        pdf.text(`₹ ${examPrice}`, 160, currentY, { align: 'center' });
      }
      currentY += 14;
    } else {
      pdf.text(`Exam: ${examTitle}`, 25, currentY);
      
      // For free exam, show "FREE" instead of price
      if (isFree || parseFloat(examPrice) === 0) {
        pdf.text('FREE', 160, currentY, { align: 'center' });
      } else {
        pdf.text(`₹ ${examPrice}`, 160, currentY, { align: 'center' });
      }
      currentY += 7;
    }
    
    // Access details
    pdf.text(`Access Duration: ${selectedExam.duration}`, 25, currentY);
    currentY += 7;
    pdf.text(`Expiry Date: ${formatDate(expirationDate)}`, 25, currentY);
    currentY += 10;
    
    // Total Amount Box
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
    
    // For free exam, show "FREE" instead of price
    if (isFree || parseFloat(examPrice) === 0) {
      pdf.text('FREE', 180, currentY + 20, { align: 'right' });
    } else {
      pdf.text(`INR ${examPrice}`, 180, currentY + 20, { align: 'right' });
    }
    
    // Footer with top border
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, 265, 190, 265);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.text('Thank you for your purchase. This is a computer-generated invoice.', 105, 272, { align: 'center' });
    pdf.text('For any queries, please contact ARN support team.', 105, 279, { align: 'center' });
    pdf.text('You can reach us through the Help section as well.', 105, 286, { align: 'center' });
    
    // Save PDF
    const filename = `Invoice_${purchasedStudentDetails.name || 'Student'}_${paymentId ? paymentId.substring(0, 6) : 'FREE'}.pdf`;
    pdf.save(filename);
    
    toast.success('Invoice downloaded successfully!', {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    toast.error('Failed to generate invoice. Please try again.');
  }
};



  // Handle PDF Download
  const handlePDFDownload = (studentDetails, purchaseDate) => {
    const doc = generateStudentPDF(studentDetails, purchaseDate);
    doc.save(`student_details_${studentDetails.studentId}.pdf`);
  };

  // Verify Student ID
  const handleStudentIdVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/verify-student/${studentId}`);
      
      if (response.data.exists) {
        // Auto-fill form data with existing student details
        setExistingStudentDetails(response.data.studentDetails);
        setFormData({
          name: response.data.studentDetails.name || '',
          age: response.data.studentDetails.age || '',
          gender: response.data.studentDetails.gender || '',
          phoneNo: response.data.studentDetails.phoneNo || '',
          email: response.data.studentDetails.email || '',
          district: response.data.studentDetails.district || '',
          state: response.data.studentDetails.state || ''
        });

        // Ask if the user wants to edit their details or proceed directly
        setIsEditingExistingData(true);
        setStage('newRegistration');
        setIsNewStudent(false);
      } else {
        toast.error('Student ID not found. Please register as a new student.', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      toast.error('Error verifying student ID. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Proceed with existing data without editing
  const handleProceedWithExistingData = () => {
    setStage('examDetails');
  };

  // Handle exam purchase
  const handleExamPurchase = async () => {
    setIsLoading(true);
    try {
      let studentDetails = existingStudentDetails;
      let currentPurchaseDate = new Date().toISOString();

      // If it's a new student, register first
      if (isNewStudent) {
        // Prepare registration data
        const registrationData = {
          ...formData,
          studentId: `STD-${Date.now()}`
        };

        // Save new student registration
        const registrationResponse = await axios.post(`${API_BASE_URL}/api/register-student`, registrationData);

        if (!registrationResponse.data.success) {
          toast.error('Registration failed. Please try again.', {
            position: "top-right",
            autoClose: 5000,
          });
          setIsLoading(false);
          return;
        }

        studentDetails = {
          ...registrationData,
          studentId: registrationResponse.data.studentId
        };
      } else if (isEditingExistingData) {
        // Update existing student details
        const updateResponse = await axios.put(`${API_BASE_URL}/api/update-student/${existingStudentDetails.studentId}`, formData);
        
        if (!updateResponse.data.success) {
          toast.error('Failed to update student information. Please try again.', {
            position: "top-right",
            autoClose: 5000,
          });
          setIsLoading(false);
          return;
        }
        
        studentDetails = {
          ...formData,
          studentId: existingStudentDetails.studentId
        };
      }

      // Parse duration to calculate expiration date
      const durationDays = parseInt(selectedExam.duration.split(' ')[0]);
      const expiryDate = new Date(currentPurchaseDate);
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      setExpirationDate(expiryDate);

      

      // If exam is free (cost is 0), process directly
      if (selectedExam.fees === 0) {
        // Save exam purchase
        const purchaseResponse = await axios.post(`${API_BASE_URL}/api/save-exam-purchase`, {
          studentId: studentDetails.studentId,
          examDetails: {
            ...selectedExam,
            expirationDate: expiryDate.toISOString()
          },
          paymentDetails: { amount: 0, status: 'free' },
          purchaseDate: currentPurchaseDate
        });

        // Show exam details modal and store student details
        setPurchasedStudentDetails(studentDetails);
        setShowExamDetailsModal(true);
        setIsPurchased(true);
        setIsLoading(false);

        // Automatically download PDF and hide modal after 2 seconds
        setTimeout(() => {
          handlePDFDownload(studentDetails, currentPurchaseDate);
          setShowExamDetailsModal(false);
        }, 2000);

        return;
      }

      // Initiate Razorpay payment
      const orderResponse = await axios.post(`${API_BASE_URL}/api/create-order`, {
        amount: selectedExam.fees,
        studentId: studentDetails.studentId
      });

      const { order } = orderResponse.data;

      const options = {
        key: "rzp_live_bvTvgAdltDUW4O", // Replace with your Razorpay key
        amount: order.amount,
        currency: order.currency,
        name: 'Arn Exam PrivateExam Conduct',
        description: `${selectedExam.title} Exam Purchase`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const paymentVerifyResponse = await axios.post(`${API_BASE_URL}/api/verify-payment`, {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              studentId: studentDetails.studentId,
              examId: selectedExam.id
            });

            if (paymentVerifyResponse.data.success) {
              setPaymentDetails(paymentVerifyResponse.data.payment);
              // Save exam purchase with expiration date
              const purchaseResponse = await axios.post(`${API_BASE_URL}/api/save-exam-purchase`, {
                studentId: studentDetails.studentId,
                examDetails: {
                  ...selectedExam,
                  expirationDate: expiryDate.toISOString()
                },
                paymentDetails: paymentVerifyResponse.data.payment,
                purchaseDate: currentPurchaseDate
              });

              // Show exam details modal and store student details
              setPurchasedStudentDetails(studentDetails);
              setShowExamDetailsModal(true);
              setIsPurchased(true);

              // Automatically download PDF and hide modal after 2 seconds
              setTimeout(() => {
                handlePDFDownload(studentDetails, currentPurchaseDate);
                setShowExamDetailsModal(false);
              }, 2000);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please try again.', {
              position: "top-right",
              autoClose: 5000,
            });
          }
        },
        prefill: {
          name: studentDetails.name,
          email: studentDetails.email || '',
          contact: studentDetails.phoneNo
        },
        theme: {
          color: '#0a2342'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Exam purchase error:', error);
      toast.error('Failed to purchase exam. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Render different stages
  const renderContent = () => {
    switch (stage) {
      case 'studentId':
        return (
          <Container className="mt-5">
            <Row className="justify-content-center">
              <Col md={6}>
                <Card className="shadow-lg border-0 rounded-lg">
                  <Card.Header className="bg-primary text-white text-center py-4">
                    <h3 className="mb-0">Practice Test Registration</h3>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleStudentIdVerification}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Enter Student ID</Form.Label>
                        <Form.Control
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="Enter your student ID"
                          required
                          className="form-control-lg"
                        />
                        <Form.Text className="text-muted">
                          Enter your ID to auto-fill your details
                        </Form.Text>
                      </Form.Group>
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 py-2 mb-3 fw-bold"
                        disabled={isLoading}
                      >
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Verify Student ID'}
                      </Button>
                    </Form>
                    <div className="text-center mt-4">
                      <Button 
                        variant="gradient-primary" 
                        className="register-new-btn w-100 py-3"
                        onClick={() => {
                          setStage('newRegistration');
                          setIsNewStudent(true);
                          setIsEditingExistingData(false);
                        }}
                      >
                        <i className="fas fa-user-plus me-2"></i> Register as New Student
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        );

      case 'newRegistration':
        return (
          <Container className="mt-5">
            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <Card className="shadow-lg border-0 rounded-lg">
                  <Card.Header className="bg-primary text-white text-center py-4">
                    <h3 className="mb-0">
                      {isEditingExistingData ? 'Update Student Information' : 'New Student Registration'}
                    </h3>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {isEditingExistingData && (
                      <Alert variant="info" className="mb-4">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-info-circle me-2 fs-4"></i>
                          <div>
                            <p className="mb-1"><strong>You are editing existing student data.</strong></p>
                            <p className="mb-0">Student ID: <Badge bg="primary">{existingStudentDetails.studentId}</Badge></p>
                          </div>
                        </div>
                      </Alert>
                    )}
                    
                    <Form onSubmit={(e) => e.preventDefault()}>
                      <Row>
                        <Form.Group as={Col} md={6} className="mb-3">
                          <Form.Label className="fw-bold">Full Name</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="Enter full name"
                            className="form-control-lg"
                          />
                        </Form.Group>
                        <Form.Group as={Col} md={6} className="mb-3">
                          <Form.Label className="fw-bold">Age</Form.Label>
                          <Form.Control
                            required
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleFormChange}
                            min="10"
                            max="100"
                            placeholder="Enter age"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Row>

                      <Row>
                        <Form.Group as={Col} md={6} className="mb-3">
                          <Form.Label className="fw-bold">Gender</Form.Label>
                          <Form.Select
                            required
                            name="gender"
                            value={formData.gender}
                            onChange={handleFormChange}
                            className="form-control-lg"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md={6} className="mb-3">
                          <Form.Label className="fw-bold">Phone Number</Form.Label>
                          <Form.Control
                            required
                            type="tel"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleFormChange}
                            pattern="[0-9]{10}"
                            placeholder="Enter 10-digit phone number"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Email (Optional)</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="Enter email address"
                          className="form-control-lg"
                        />
                      </Form.Group>

                      <Row>
                        <Form.Group as={Col} md={6} className="mb-3">
                          <Form.Label className="fw-bold">District</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleFormChange}
                            placeholder="Enter district"
                            className="form-control-lg"
                          />
                        </Form.Group>
                        <Form.Group as={Col} md={6} className="mb-3">
                          <Form.Label className="fw-bold">State</Form.Label>
                          <Form.Select
                            required
                            name="state"
                            value={formData.state}
                            onChange={handleFormChange}
                            className="form-control-lg"
                          >
                            <option value="">Select State</option>
                            {indianStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Row>

                      <div className="d-grid gap-2 mt-4">
                        <Button 
                          variant="primary" 
                          onClick={() => setStage('examDetails')}
                          className="py-3 fw-bold"
                          disabled={
                            !formData.name || 
                            !formData.age || 
                            !formData.gender || 
                            !formData.phoneNo || 
                            !formData.district || 
                            !formData.state
                          }
                        >
                          Proceed to Exam Details
                        </Button>
                        
                        {isEditingExistingData && (
                          <Button 
                            variant="outline-secondary" 
                            onClick={handleProceedWithExistingData}
                            className="py-2"
                          >
                            Continue with Original Data
                          </Button>
                        )}
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        );

      case 'examDetails':
        return (
          <Container className="mt-5">
            <Row className="justify-content-center">
              <Col md={8}>
                <Card className="shadow-lg border-0 rounded-lg">
                  <Card.Header className="bg-primary text-white text-center py-4">
                    <h3 className="mb-0">Exam Purchase Confirmation</h3>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <h4 className="text-center mb-4 fw-bold">Exam Details</h4>
                    <div className="exam-details-container p-3 mb-4 border rounded bg-light">
                      <Row className="mb-3">
                        <Col md={4}><strong>Exam:</strong> {selectedExam.title}</Col>
                        <Col md={4}><strong>Category:</strong> {selectedExam.category}</Col>
                        <Col md={4}><strong>Price:</strong> INR {selectedExam.fees}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col><strong>Validity:</strong> {selectedExam.duration}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col>
                          <strong>Student Name:</strong> {isNewStudent ? formData.name : (isEditingExistingData ? formData.name : existingStudentDetails.name)}
                        </Col>
                        <Col>
                          <strong>Student ID:</strong> {isNewStudent ? 'Will be generated' : existingStudentDetails.studentId}
                        </Col>
                      </Row>
                    </div>
                    
                    {/* Purchase Button */}
                    <div className="d-grid gap-2">
                      {!isPurchased ? (
                        <Button 
                          variant="success" 
                          className="py-3 fw-bold"
                          onClick={handleExamPurchase}
                          disabled={isLoading}
                        >
                          {isLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Purchase'}
                        </Button>
                      ) : (
                        <>
                          {/* Invoice download section - only shown after purchase */}
                          <div className="alert alert-warning mt-3">
                            <strong>Important:</strong> If you don't download your invoice now, you won't be able to access it in the future. Please make sure to download and save it.
                          </div>
                          <Button 
                            variant="primary" 
                            className="py-3 fw-bold mb-3"
                            onClick={generateInvoicePDF}
                          >
                            <i className="fas fa-file-invoice me-2"></i> Download Invoice
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            className="py-2"
                            onClick={handleBackToHome}
                          >
                            Back to Home
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <ToastContainer />
      {renderContent()}

      {/* Exam Details Modal */}
      <Modal show={showExamDetailsModal} onHide={() => setShowExamDetailsModal(false)} centered>
        <Modal.Header className="bg-success text-white">
          <Modal.Title>Exam Purchase Successful!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {purchasedStudentDetails && (
            <div>
              <p><strong>Exam:</strong> {selectedExam.title}</p>
              <p><strong>Student Name:</strong> {purchasedStudentDetails.name}</p>
              <p><strong>Student ID:</strong> {purchasedStudentDetails.studentId}</p>
              <p><strong>Valid Until:</strong> {expirationDate && formatDate(expirationDate)}</p>
              <div className="alert alert-info mt-3">
                <i className="fas fa-download me-2"></i> Your exam details PDF is being downloaded...
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExamPurchaseRegistration;