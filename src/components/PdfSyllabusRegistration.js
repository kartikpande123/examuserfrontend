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
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import API_BASE_URL from './ApiConifg';
import { jsPDF } from "jspdf";

const PdfSyllabusRegistration = () => {
  // State management
  const [stage, setStage] = useState('studentId'); 
  const [studentId, setStudentId] = useState('');
  const [existingStudentDetails, setExistingStudentDetails] = useState(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [isEditingExistingData, setIsEditingExistingData] = useState(false);
  const [showSyllabusDetailsModal, setShowSyllabusDetailsModal] = useState(false);
  const [purchasedStudentDetails, setPurchasedStudentDetails] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(null);

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

  // Load selected syllabus from navigation state
  useEffect(() => {
    if (location.state && location.state.selectedSyllabus) {
      setSelectedSyllabus(location.state.selectedSyllabus);
    } else {
      navigate('/syllabi');
    }
  }, [location.state, navigate]);

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

  // Handle Student ID Verification
  const handleStudentIdVerification = async (e) => {
    e.preventDefault();
    
    // Validate that student ID is exactly 6 digits
    if (!/^\d{6}$/.test(studentId)) {
      setError('Student ID must be exactly 6 digits.');
      toast.error('Student ID must be exactly 6 digits.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // API call to verify student ID
      const response = await axios.get(`${API_BASE_URL}/api/pdf-verify-student/${studentId}`);
      
      if (response.data.exists) {
        // Student exists
        const studentDetails = response.data.studentDetails;
        
        setExistingStudentDetails(studentDetails);
        setFormData({
          name: studentDetails.name,
          age: studentDetails.age,
          gender: studentDetails.gender,
          phoneNo: studentDetails.phoneNo,
          email: studentDetails.email || '',
          district: studentDetails.district,
          state: studentDetails.state
        });

        // Check for existing purchases
        const purchasesResponse = await axios.get(`${API_BASE_URL}/api/pdf-student-purchases/${studentId}`);
        
        if (purchasesResponse.data.success && purchasesResponse.data.purchases) {
          const hasPurchasedThisSyllabus = purchasesResponse.data.purchases.some(
            purchase => purchase.syllabusId === selectedSyllabus.id
          );
          
          if (hasPurchasedThisSyllabus) {
            toast.info('You have already purchased this syllabus. You can access it from your dashboard.', {
              position: "top-right",
              autoClose: 5000,
            });
          }
        }

        // Change: Redirect to newRegistration stage to allow editing
        setIsEditingExistingData(true);
        setStage('newRegistration'); // Redirect to form instead of syllabusDetails
        setIsNewStudent(false);
        toast.success('Student ID verified successfully! You can now update your details if needed.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Student not found
        toast.error('Student ID not found. Please register as a new student.', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error verifying student ID:', error);
      setError('Failed to verify student ID. Please try again.');
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

  // Register or update student after payment completion
  const registerOrUpdateStudentAfterPayment = async () => {
    try {
      let responseData;
      let newStudentId = existingStudentDetails?.studentId;
      
      if (isNewStudent) {
        // For new students, we're using only 6-digit number for student ID
        const studentData = {
          ...formData
          // Removed studentId generation - backend will handle this
        };
        
        const response = await axios.post(`${API_BASE_URL}/api/pdf-register-student`, studentData);
        responseData = response.data;
        
        if (responseData.success) {
          newStudentId = responseData.studentId;
          setExistingStudentDetails({
            ...formData,
            studentId: newStudentId
          });
        } else {
          throw new Error('Failed to register student');
        }
      } else if (isEditingExistingData) {
        // Update existing student
        const response = await axios.put(`${API_BASE_URL}/api/pdf-update-student/${existingStudentDetails.studentId}`, formData);
        responseData = response.data;
        
        if (!responseData.success) {
          throw new Error('Failed to update student details');
        }
      }
      
      return newStudentId;
    } catch (error) {
      console.error('Error in student registration/update:', error);
      throw error;
    }
  };

  // Update student details
  const handleUpdateStudentDetails = async () => {
    if (!existingStudentDetails || !existingStudentDetails.studentId) {
      toast.error('Student ID is missing. Cannot update details.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update existing student details using the API
      const response = await axios.put(
        `${API_BASE_URL}/api/pdf-update-student/${existingStudentDetails.studentId}`, 
        formData
      );

      if (response.data.success) {
        setExistingStudentDetails({
          ...response.data.studentDetails
        });
        
        toast.success('Student details updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Proceed to syllabus details after successful update
        setStage('syllabusDetails');
      } else {
        throw new Error(response.data.error || 'Failed to update student details');
      }
    } catch (error) {
      console.error('Error updating student details:', error);
      setError('Failed to update student details. Please try again.');
      toast.error(`Update failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Proceed to syllabus details without editing
  const handleProceedWithExistingData = () => {
    setStage('syllabusDetails');
  };

  // Handle proceed to syllabus details for new registration
  const handleProceedToSyllabusDetails = () => {
    // Validate form
    if (!formData.name || !formData.age || !formData.gender || 
        !formData.phoneNo || !formData.district || !formData.state) {
      setError('Please fill in all required fields.');
      toast.error('Please fill in all required fields.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    if (isEditingExistingData) {
      // If editing existing data, update student details first
      handleUpdateStudentDetails();
    } else {
      // For new students, just proceed to next step
      setStage('syllabusDetails');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/pdfsyllabusdashboard');
  };

  // Create Razorpay order
  const createOrder = async () => {
    try {
      // Validate that this isn't a free syllabus
      const price = selectedSyllabus?.fees;
      if (price === 0 || price === '0' || price === undefined || price === null || price === '') {
        throw new Error('Cannot create payment order for free syllabus');
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/create-pdf-order`, {
        amount: price,
        notes: {
          syllabusId: selectedSyllabus?.id || '',
          syllabusTitle: selectedSyllabus?.title || '',
          studentId: isNewStudent ? 
            'new_student' : // We don't have ID yet for new students
            existingStudentDetails?.studentId || ''
        }
      });
      
      if (response.data.success) {
        return response.data.order;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Verify payment
  const verifyPayment = async (paymentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/verify-pdf-payment`, {
        orderId: paymentData.razorpay_order_id,
        paymentId: paymentData.razorpay_payment_id,
        signature: paymentData.razorpay_signature,
        syllabusId: selectedSyllabus?.id || '',
        filePath: selectedSyllabus?.filePath || '',
        userId: isNewStudent ? 'new_student' : existingStudentDetails?.studentId || ''
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  // Save syllabus purchase details
  const savePurchaseDetails = async (paymentVerified, studentId) => {
    try {
      const currentDate = new Date();
      setPurchaseDate(currentDate);
      
      // Calculate expiration date
      const durationDays = selectedSyllabus ? parseInt(selectedSyllabus.duration?.split(' ')[0] || 30) : 30;
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      setExpirationDate(expiryDate);
      
      const response = await axios.post(`${API_BASE_URL}/api/pdf-save-syllabus-purchase`, {
        studentId: studentId,
        syllabusDetails: {
          id: selectedSyllabus?.id || '',
          title: selectedSyllabus?.title || '',
          category: selectedSyllabus?.category || '',
          price: selectedSyllabus?.fees || 0,
          duration: selectedSyllabus?.duration || '30 Days',
          description: selectedSyllabus?.description || '',
          filePath: selectedSyllabus?.filePath || `syllabi/${selectedSyllabus?.id}.pdf` || '',
          expirationDate: expiryDate.toISOString()
        },
        paymentDetails: {
          status: 'completed',
          amount: selectedSyllabus?.fees || 0,
          paymentId: paymentId,
          orderId: orderId
        },
        purchaseDate: currentDate.toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving purchase details:', error);
      throw error;
    }
  };

  // Generate PDF receipt
  const generateStudentPDF = (studentDetails) => {
    const doc = new jsPDF();
    const currentDate = purchaseDate || new Date();
    
    // Calculate expiration date
    const durationDays = selectedSyllabus.duration.split(' ')[0];
    const expiry = new Date(currentDate);
    expiry.setDate(expiry.getDate() + parseInt(durationDays));
    
    // ===== 1. Professional Header =====
    doc.setFillColor(10, 35, 66);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ARN PDF SYLLABUS PURCHASE", 105, 25, { align: 'center' });
    
    // ===== 2. Student ID (Highlighted) =====
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 50, 170, 15, 'F');
    doc.setTextColor(10, 35, 66);
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
    
    // ===== 4. Syllabus Details (Updated with Expiry Inside) =====
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 130, 170, 75, 'FD'); // Increased height to fit expiry
    
    doc.setTextColor(10, 35, 66);
    doc.setFont("helvetica", "bold");
    doc.text("SYLLABUS DETAILS", 30, 140);
    
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(`Title: ${selectedSyllabus.title}`, 30, 150);
    doc.text(`Category: ${selectedSyllabus.category}`, 30, 160);
    doc.text(`Purchase Date: ${formatDate(currentDate)}`, 30, 170);

    // Expiry Date Highlighted in Red (Inside Syllabus Details)
    doc.setTextColor(180, 0, 0); 
    doc.setFont("helvetica", "bold");
    doc.text(`Expires On: ${formatDate(expiry)}`, 30, 180);
    
    // ===== 5. Important Notes Section =====
    doc.setDrawColor(10, 35, 66);
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
        "Once a syllabus is purchased, it is non-refundable under any circumstances.",
        "With your Student ID, you may purchase any syllabus without completing additional forms.",
        "Access to the syllabus will be automatically revoked after the expiration date.",
        "Your Student ID is a 6-digit number. Please keep it for future purchases.",
        "For technical support or inquiries, please contact our Help Center.",
        "ARN is not responsible for access issues due to connectivity problems on your end."
    ];
    
    let yPos = 225;
    notes.forEach((note) => {
        doc.setFont("helvetica", "bold");
        doc.text("•", 25, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(note, 30, yPos);
        yPos += 7;
    });
    
    // ===== 7. Footer =====
    doc.setFillColor(10, 35, 66);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('© 2025/26 ARN PDF SYLLABUS. All rights reserved.', 105, 288, { align: 'center' });
    
    return doc;
};

  // Download PDF receipt
  const downloadPdfReceipt = (studentDetails) => {
    const doc = generateStudentPDF(studentDetails);
    doc.save(`ARN_Syllabus_Receipt_${studentDetails.studentId}.pdf`);
  };

  // Process everything after successful payment
  const processSuccessfulPayment = async (paymentResponse, order) => {
    setIsLoading(true);
    
    try {
      // Step 1: Set payment IDs in state
      setPaymentId(paymentResponse.razorpay_payment_id);
      setOrderId(order.id);
      
      // Step 2: Verify payment with backend
      const paymentVerified = await verifyPayment(paymentResponse);
      
      if (!paymentVerified.success) {
        throw new Error('Payment verification failed');
      }
      
      // Step 3: Register or update student data in DB
      const studentId = await registerOrUpdateStudentAfterPayment();
      
      if (!studentId) {
        throw new Error('Failed to get student ID');
      }
      
      // Step 4: Save purchase details
      const purchaseSaved = await savePurchaseDetails(paymentVerified, studentId);
      
      if (!purchaseSaved.success) {
        throw new Error('Failed to save purchase details');
      }
      
      // Step 5: Prepare student details for receipt and UI
      const studentDetails = {
        ...formData,
        studentId: studentId
      };
      
      // Step 6: Update UI states
      setPurchasedStudentDetails(studentDetails);
      setIsPurchased(true);
      setShowSyllabusDetailsModal(true);
      
      // Step 7: Generate and download PDF receipt
      setTimeout(() => {
        downloadPdfReceipt(studentDetails);
      }, 1000);
      
      toast.success('Syllabus purchased successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(`Payment processing error: ${error.message}. Please contact support.`, {
        position: "top-right",
        autoClose: 5000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async (order) => {
    const options = {
      key: "rzp_live_bvTvgAdltDUW4O",
      amount: order.amount,
      currency: order.currency,
      name: 'PDF Syllabus',
      description: `Purchase: ${selectedSyllabus?.title || 'Syllabus'}`,
      order_id: order.id,
      handler: async function (response) {
        // Process everything after payment is successful
        await processSuccessfulPayment(response, order);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phoneNo
      },
      theme: {
        color: '#17a2b8'
      },
      modal: {
        ondismiss: function() {
          setIsLoading(false);
          toast.info('Payment cancelled', {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  // Handle syllabus purchase
  // Modified function to handle syllabus purchase
  const handleSyllabusPurchase = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Check if the syllabus is free (handling both undefined and various zero representations)
      const syllabusPrice = selectedSyllabus?.fees;
      const isFree = syllabusPrice === 0 || syllabusPrice === '0' || syllabusPrice === undefined || syllabusPrice === null || syllabusPrice === '';
      
      if (isFree) {
        console.log('Processing free syllabus purchase');
        
        // Generate free order and payment IDs
        const freeOrderId = `FREE-ORDER-${Date.now()}`;
        const freePaymentId = `FREE-${Date.now()}`;
        
        setOrderId(freeOrderId);
        setPaymentId(freePaymentId);
        
        // Step 1: Register or update student data in DB
        const studentId = await registerOrUpdateStudentAfterPayment();
        
        if (!studentId) {
          throw new Error('Failed to get student ID');
        }
        
        // Set current date for purchase
        const currentDate = new Date();
        setPurchaseDate(currentDate);
        
        // Calculate expiration date
        const durationDays = selectedSyllabus?.duration ? parseInt(selectedSyllabus.duration.split(' ')[0]) : 30;
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        setExpirationDate(expiryDate);
        
        // Step 2: Save purchase details with free purchase info
        const purchaseData = {
          studentId: studentId,
          syllabusDetails: {
            id: selectedSyllabus?.id || '',
            title: selectedSyllabus?.title || '',
            category: selectedSyllabus?.category || '',
            price: 0, // Explicitly set price to 0
            duration: selectedSyllabus?.duration || '30 Days',
            description: selectedSyllabus?.description || '',
            filePath: selectedSyllabus?.filePath || `syllabi/${selectedSyllabus?.id}.pdf` || '',
            expirationDate: expiryDate.toISOString()
          },
          paymentDetails: {
            status: 'completed',
            amount: 0,
            paymentId: freePaymentId,
            orderId: freeOrderId
          },
          purchaseDate: currentDate.toISOString()
        };
        
        console.log('Sending purchase data:', purchaseData);
        
        const purchaseResponse = await axios.post(`${API_BASE_URL}/api/pdf-save-syllabus-purchase`, purchaseData);
        
        if (!purchaseResponse.data || !purchaseResponse.data.success) {
          console.error('Purchase save response:', purchaseResponse.data);
          throw new Error(purchaseResponse.data?.message || 'Failed to save purchase details');
        }
        
        // Step 3: Prepare student details for receipt and UI
        const studentDetails = {
          ...formData,
          studentId: studentId
        };
        
        // Step 4: Update UI states
        setPurchasedStudentDetails(studentDetails);
        setIsPurchased(true);
        setShowSyllabusDetailsModal(true);
        
        // Step 5: Generate and download PDF receipt
        setTimeout(() => {
          downloadPdfReceipt(studentDetails);
        }, 1000);
        
        toast.success('Free syllabus added to your account!', {
          position: "top-right",
          autoClose: 3000,
        });
        
      } else {
        // For paid syllabus, continue with the existing Razorpay flow
        console.log('Processing paid syllabus purchase, price:', syllabusPrice);
        
        // Create Razorpay order
        const order = await createOrder();
        setOrderId(order.id);
        
        // Open Razorpay payment popup
        await handleRazorpayPayment(order);
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      setError(`Failed to process purchase: ${error.message}`);
      toast.error(`Error processing purchase: ${error.message}. Please try again.`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Go to dashboard
  const handleGoToDashboard = () => {
    navigate('/dashboard');
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
                  <Card.Header className="bg-info text-white text-center py-4">
                    <h3 className="mb-0">PDF Syllabus Registration</h3>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleStudentIdVerification}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Enter Student ID</Form.Label>
                        <Form.Control
                          type="text"
                          value={studentId}
                          onChange={(e) => {
                            // Only allow digits and limit to 6
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 6) {
                              setStudentId(value);
                            }
                          }}
                          placeholder="Enter your 6-digit student ID"
                          required
                          className="form-control-lg"
                          inputMode="numeric"
                        />
                        <Form.Text className="text-muted">
                          Enter your 6-digit ID to quickly proceed with your purchase
                        </Form.Text>
                      </Form.Group>
                      <Button 
                        variant="info" 
                        type="submit" 
                        className="w-100 py-2 mb-3 fw-bold text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Verify Student ID'}
                      </Button>
                    </Form>
                    <div className="text-center mt-4">
                      <Button 
                        variant="gradient-info" 
                        className="register-new-btn w-100 py-3 text-white"
                        onClick={() => {
                          setStage('newRegistration');
                          setIsNewStudent(true);
                          setIsEditingExistingData(false);
                          // Reset form data
                          setFormData({
                            name: '',
                            age: '',
                            gender: '',
                            phoneNo: '',
                            email: '',
                            district: '',
                            state: ''
                          });
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
                  <Card.Header className="bg-info text-white text-center py-4">
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
                            <p className="mb-0">Student ID: <Badge bg="info">{existingStudentDetails.studentId}</Badge></p>
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
                          variant="info" 
                          onClick={handleProceedToSyllabusDetails}
                          className="py-3 fw-bold text-white"
                          disabled={
                            isLoading ||
                            !formData.name || 
                            !formData.age || 
                            !formData.gender || 
                            !formData.phoneNo || 
                            !formData.district || 
                            !formData.state
                          }
                        >
                          {isLoading ? <Spinner animation="border" size="sm" /> : 'Proceed to Syllabus Details'}
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
      case 'syllabusDetails':
        return (
          <Container className="mt-5">
            <Row className="justify-content-center">
              <Col md={8}>
                <Card className="shadow-lg border-0 rounded-lg">
                  <Card.Header className="bg-info text-white text-center py-4">
                    <h3 className="mb-0">PDF Syllabus Purchase Confirmation</h3>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <h4 className="text-center mb-4 fw-bold">Syllabus Details</h4>
                    <div className="syllabus-details-container p-3 mb-4 border rounded bg-light">
                      <Row className="mb-3">
                        <Col md={6}><strong>Title:</strong> {selectedSyllabus?.title || 'Sample Syllabus'}</Col>
                        <Col md={6}><strong>Category:</strong> {selectedSyllabus?.category || 'General'}</Col>
                      </Row>
                      <Row className="mb-3">
                      <Col md={6}><strong>Price:</strong> INR {selectedSyllabus?.fees || '0'}</Col>
                        <Col md={6}><strong>Validity:</strong> {selectedSyllabus?.duration || '30 Days'}</Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Student Name:</strong> {isNewStudent ? formData.name : (isEditingExistingData ? formData.name : existingStudentDetails?.name || '')}
                        </Col>
                        <Col md={6}>
                          <strong>Student ID:</strong> {isNewStudent ? 'Will be generated' : existingStudentDetails?.studentId || ''}
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <strong>Description:</strong> {selectedSyllabus?.description || 'Comprehensive PDF syllabus for exam preparation.'}
                        </Col>
                      </Row>
                    </div>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="success" 
                        className="py-3 fw-bold"
                        onClick={handleSyllabusPurchase}
                        disabled={isLoading || isPurchased}
                      >
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Purchase'}
                      </Button>
                      {isPurchased && (
                        <Button 
                          variant="info" 
                          className="py-2 mt-3 text-white"
                          onClick={handleBackToHome}
                        >
                          Back to Syllabi
                        </Button>
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

      {/* Syllabus Details Modal */}
      <Modal show={showSyllabusDetailsModal} onHide={() => setShowSyllabusDetailsModal(false)} centered>
        <Modal.Header className="bg-success text-white">
          <Modal.Title>PDF Purchase Successful!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {purchasedStudentDetails && (
            <div>
              <p><strong>Syllabus:</strong> {selectedSyllabus?.title || 'Sample Syllabus'}</p>
              <p><strong>Student Name:</strong> {purchasedStudentDetails.name}</p>
              <p><strong>Student ID:</strong> {purchasedStudentDetails.studentId}</p>
              <p><strong>Payment ID:</strong> {paymentId}</p>
              <p><strong>Valid Until:</strong> {expirationDate && formatDate(expirationDate)}</p>
              <div className="alert alert-info mt-3">
                <i className="fas fa-download me-2"></i> Your purchase receipt is being downloaded...
              </div>
              <div className="alert alert-success mt-3">
                <i className="fas fa-check-circle me-2"></i> You can now access this PDF syllabus in your dashboard.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleBackToHome}>
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PdfSyllabusRegistration;