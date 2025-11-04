import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form, Badge } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import axios from "axios";
import API_BASE_URL from "./ApiConfig";
import { 
  CheckCircle, 
  Video, 
  FileText, 
  BookOpen, 
  Headphones, 
  Shield, 
  Star,
  AlertCircle,
  Download,
  Users,
  Zap,
  Key,
  ArrowRight
} from "lucide-react";
import logo from "../Images/LOGO.jpg"

// Add keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default function SuperUserDashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchSubscriptions();
  }, []);
  
  // User registration states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [userId, setUserId] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phoneNo: "",
    email: "",
    district: "",
    state: ""
  });
  
  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedUserDetails, setPurchasedUserDetails] = useState(null);
  const [purchaseExpiry, setPurchaseExpiry] = useState(null);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Fetch subscription plans
  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin-super-user`);
      
      if (res.data.success) {
        setSubscriptions(res.data.data);
      } else {
        setError(res.data.message || "Failed to load subscriptions");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching subscriptions");
    } finally {
      setLoading(false);
    }
  };

  // Handle purchase button click
  const handlePurchaseClick = (sub) => {
    setSelectedSubscription(sub);
    setShowRegistrationModal(true);
    setUserId("");
    setIsExistingUser(false);
    setUserFormData({
      name: "",
      age: "",
      gender: "",
      phoneNo: "",
      email: "",
      district: "",
      state: ""
    });
  };

  // Check if user ID exists
  const handleUserIdCheck = async () => {
    if (!/^\d{6}$/.test(userId)) {
      toast.error("User ID must be exactly 6 digits.");
      return;
    }

    setIsCheckingUser(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/super-user-verify/${userId}`);
      
      if (response.data.exists) {
        const userDetails = response.data.userDetails;
        setUserFormData({
          name: userDetails.name,
          age: userDetails.age,
          gender: userDetails.gender,
          phoneNo: userDetails.phoneNo,
          email: userDetails.email || "",
          district: userDetails.district,
          state: userDetails.state
        });
        setIsExistingUser(true);
        toast.success("User ID verified successfully!");
      } else {
        toast.error("User ID not found. Please fill in the registration form.");
        setIsExistingUser(false);
      }
    } catch (error) {
      console.error("Error verifying user ID:", error);
      toast.error("Error verifying user ID. Please try again.");
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date
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

  // Generate PDF receipt
  const generateUserPDF = (userDetails, subscription, expiryDate) => {
  const doc = new jsPDF();
  const currentDate = new Date();

  // Header with logo
  doc.setFillColor(10, 35, 66);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add logo (left side)
  try {
    doc.addImage(logo, 'PNG', 20, 5, 30, 30);
  } catch (error) {
    console.log('Logo not loaded, proceeding without logo');
  }

  // Company details (centered)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ARN PVT SUPER USER", 105, 15, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Karnataka India 580011", 105, 22, { align: 'center' });
  doc.text("Phone: +91 6360785195", 105, 28, { align: 'center' });
  doc.text("Email: jubedakbar@gmail.com", 105, 34, { align: 'center' });

  // User ID (Highlighted)
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 50, 170, 15, 'F');
  doc.setTextColor(10, 35, 66);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`USER ID: ${userDetails.userId}`, 105, 60, { align: 'center' });

  // User Details
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  let userY = 85;
  doc.text(`Name: ${userDetails.name}`, 20, userY);
  doc.text(`Age: ${userDetails.age}`, 20, userY + 10);
  doc.text(`Gender: ${userDetails.gender}`, 20, userY + 20);
  doc.text(`Contact: ${userDetails.phoneNo}`, 20, userY + 30);
  
  if (userDetails.email) {
    doc.text(`Email: ${userDetails.email}`, 20, userY + 40);
    userY += 10;
  }
  
  doc.text(`Location: ${userDetails.district}, ${userDetails.state}`, 20, userY + 40);

  // Subscription Details
  const detailsY = userY + 55;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.rect(20, detailsY, 170, 75, 'FD');

  doc.setTextColor(10, 35, 66);
  doc.setFont("helvetica", "bold");
  doc.text("SUBSCRIPTION DETAILS", 30, detailsY + 10);

  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(`Plan: ${subscription.month}-Month Super User Plan`, 30, detailsY + 20);
  doc.text(`Amount Paid: ${subscription.finalPrice} INR`, 30, detailsY + 30);
  doc.text(`Discount Applied: ${subscription.discountPercent}%`, 30, detailsY + 40);
  doc.text(`Purchase Date: ${formatDate(currentDate)}`, 30, detailsY + 50);

  doc.setTextColor(180, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Valid Until: ${formatDate(expiryDate)} (${subscription.totalDays} days)`, 30, detailsY + 60);

  // Important Notes Section
  const notesY = detailsY + 85;
  doc.setDrawColor(10, 35, 66);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(20, notesY, 170, 65, 3, 3, 'FD');

  doc.setTextColor(10, 35, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("IMPORTANT NOTES", 105, notesY + 10, { align: 'center' });

  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const notes = [
    "Once a super user subscription is purchased, it is non-refundable under any circumstances.",
    "With your User ID, you may purchase any subscription without completing additional forms.",
    "Super user access will be automatically revoked after the expiration date.",
    "Your User ID is a 6-digit number. Please keep it for future purchases.",
    "For technical support or inquiries, please contact our Help Center.",
  ];

  let yPos = notesY + 20;
  notes.forEach((note) => {
    doc.setFont("helvetica", "bold");
    doc.text("•", 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(note, 30, yPos, { maxWidth: 155 });
    yPos += 7;
  });

  // Footer
  doc.setFillColor(10, 35, 66);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('© 2025/26 ARN VIDEO SYLLABUS. All rights reserved.', 105, 288, { align: 'center' });

  return doc;
};

  // Download PDF receipt
  const downloadPdfReceipt = (userDetails, subscription, expiryDate) => {
    const doc = generateUserPDF(userDetails, subscription, expiryDate);
    doc.save(`SuperUser_Receipt_${userDetails.userId}.pdf`);
  };

  // Generate invoice PDF
  const generateInvoicePDF = (userDetails, subscription, expiryDate, paymentId, orderId) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header background
      pdf.setFillColor(0, 82, 165);
      pdf.rect(0, 0, 210, 15, 'F');

      // Logo
      try {
        pdf.addImage(logo, 'PNG', 20, 20, 40, 40);
      } catch (error) {
        console.log('Logo not loaded');
      }

      // Company details
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Super User Platform', 70, 30);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Karnataka India 580011', 70, 37);
      pdf.text('Phone: +91 6360785195', 70, 44);
      pdf.text('Email: support@superuser.com', 70, 51);
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
      pdf.text(paymentId || 'N/A', 60, 102);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Order ID:', 20, 109);
      pdf.setFont('helvetica', 'normal');
      pdf.text(orderId || 'N/A', 60, 109);

      // Customer details
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 120, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(userDetails.name || 'N/A', 120, 109);
      pdf.text(userDetails.email || 'N/A', 120, 116);
      pdf.text(userDetails.phoneNo || 'N/A', 120, 123);
      pdf.text(`${userDetails.district || 'N/A'}, ${userDetails.state || 'N/A'}`, 120, 130);

      // GST Note
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 82, 165);
      pdf.setFillColor(230, 240, 255);
      pdf.roundedRect(20, 144, 170, 10, 2, 2, 'F');
      pdf.text('Note: The amount shown below is inclusive of 18% GST.', 25, 151);

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

      // Subscription details
      pdf.text(`Super User Subscription - ${subscription.month} Month Plan`, 25, currentY);
      pdf.text(`INR ${subscription.finalPrice}`, 160, currentY, { align: 'center' });
      currentY += 7;

      pdf.text(`Validity: ${subscription.totalDays} days (including ${subscription.extraDays} bonus days)`, 25, currentY);
      currentY += 7;
      pdf.text(`Discount Applied: ${subscription.discountPercent}%`, 25, currentY);
      currentY += 7;
      pdf.text(`Access Until: ${formatDate(expiryDate)}`, 25, currentY);
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
      pdf.text(`INR ${subscription.finalPrice}`, 180, currentY + 20, { align: 'right' });

      // Footer
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, 265, 190, 265);

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text('Thank you for your purchase. This is a computer-generated invoice.', 105, 272, { align: 'center' });
      pdf.text('For any queries, please contact Super User Platform support team.', 105, 279, { align: 'center' });
      pdf.text('You can reach us through the Help section as well.', 105, 286, { align: 'center' });

      const filename = `Invoice_${userDetails.name || 'User'}_${paymentId ? paymentId.substring(0, 6) : 'N/A'}.pdf`;
      pdf.save(filename);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };

  // Process payment
  const handleProceedToPurchase = async () => {
    if (!userFormData.name || !userFormData.age || !userFormData.gender ||
        !userFormData.phoneNo || !userFormData.district || !userFormData.state) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const orderRes = await axios.post(`${API_BASE_URL}/api/create-super-user-order`, {
        amount: selectedSubscription.finalPrice,
        notes: {
          planMonth: selectedSubscription.month,
          subscriptionId: selectedSubscription.id,
        },
      });

      if (!orderRes.data.success) {
        throw new Error("Failed to create order");
      }

      const order = orderRes.data.order;

      const options = {
        key: "rzp_live_bvTvgAdltDUW4O",
        amount: order.amount,
        currency: "INR",
        name: "Super User Subscription",
        description: `${selectedSubscription.month}-Month Subscription Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE_URL}/api/verify-super-user-payment`, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: userId || null,
              subscriptionId: selectedSubscription.id,
              planMonth: selectedSubscription.month,
            });

            if (!verifyRes.data.success) {
              toast.error("❌ Payment Verification Failed!");
              return;
            }

            const purchaseDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + selectedSubscription.totalDays);

            const completePurchaseRes = await axios.post(`${API_BASE_URL}/api/super-user-complete-purchase`, {
              userId: userId || null,
              name: userFormData.name,
              age: userFormData.age,
              gender: userFormData.gender,
              phoneNo: userFormData.phoneNo,
              email: userFormData.email,
              district: userFormData.district,
              state: userFormData.state,
              subscriptionDetails: {
                id: selectedSubscription.id,
                month: selectedSubscription.month,
                price: selectedSubscription.price,
                discountPercent: selectedSubscription.discountPercent,
                finalPrice: selectedSubscription.finalPrice,
                totalDays: selectedSubscription.totalDays,
                extraDays: selectedSubscription.extraDays
              },
              paymentDetails: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                amount: selectedSubscription.finalPrice,
                status: "completed"
              },
              purchaseDate: purchaseDate.toISOString(),
              expiryDate: expiryDate.toISOString()
            });

            if (completePurchaseRes.data.success) {
              const finalUserId = completePurchaseRes.data.userId;

              setPurchasedUserDetails({
                ...userFormData,
                userId: finalUserId
              });
              setPurchaseExpiry(expiryDate);
              
              setShowRegistrationModal(false);
              setShowSuccessModal(true);
              
              setTimeout(() => {
                downloadPdfReceipt(
                  { ...userFormData, userId: finalUserId },
                  selectedSubscription,
                  expiryDate
                );
              }, 1000);

              toast.success("✅ Payment Successful! Super User Subscription Activated.");
            } else {
              toast.error("❌ Failed to save purchase details!");
            }
          } catch (error) {
            console.error("Error in payment handler:", error);
            toast.error("Error processing payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userFormData.name,
          email: userFormData.email,
          contact: userFormData.phoneNo,
        },
        theme: {
          color: "#0d6efd",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);

    } catch (error) {
      console.error("Purchase Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong during purchase");
      setLoading(false);
    }
  };

  const benefits = [
    { icon: <Zap size={28} />, title: "Unlimited Live Exam Access", color: "#FF6B6B" },
    { icon: <FileText size={28} />, title: "Unlimited PDF Syllabus", color: "#4ECDC4" },
    { icon: <Video size={28} />, title: "Unlimited Video Syllabus", color: "#FFD93D" },
    { icon: <BookOpen size={28} />, title: "Unlimited Practice Tests", color: "#95E1D3" },
    { icon: <Headphones size={28} />, title: "Quick Admin Support", color: "#A78BFA" }
  ];

  const usageSteps = [
    {
      number: "01",
      title: "Practice Tests",
      description: "Navigate to the Practice Test dashboard, click 'My Practice Tests', and enter your Super User ID to unlock all available practice tests.",
      icon: <BookOpen size={32} />,
      color: "#8B5CF6"
    },
    {
      number: "02",
      title: "PDF Syllabus",
      description: "Go to the PDF Syllabus dashboard, click 'My Study Material', and input your Super User ID to access all PDF syllabus materials.",
      icon: <FileText size={32} />,
      color: "#3B82F6"
    },
    {
      number: "03",
      title: "Video Syllabus",
      description: "Visit the Video Syllabus dashboard, select 'My Video Syllabus Material', and enter your Super User ID to view all video syllabus content.",
      icon: <Video size={32} />,
      color: "#10B981"
    },
    {
      number: "04",
      title: "Live Exam Registration",
      description: "On the exam registration payment page, click 'Are you a Super User? Click here', enter your User ID to bypass payment. You'll see 'SUPER USER - NO PAYMENT REQUIRED'. Click 'Complete Registration' to download your Live Exam ID.",
      icon: <Zap size={32} />,
      color: "#F59E0B"
    },
    {
      number: "05",
      title: "24/7 Support Available",
      description: "If you encounter any issues or have questions, our admin team is available around the clock through the Help section to assist you.",
      icon: <Headphones size={32} />,
      color: "#EC4899"
    }
  ];

  return (
    <div style={styles.page}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Hero Header */}
      <header style={styles.heroHeader}>
        <Container>
          <div style={styles.heroContent}>
            <div style={styles.badgeContainer}>
              <Shield size={16} style={{marginRight: '6px'}} />
              <span>Premium Access</span>
            </div>
            <h1 style={styles.heroTitle}>
              <span style={styles.superText}>Super</span>
              <span style={styles.userText}> User </span>
              <span style={styles.subscriptionsText}>Subscriptions</span>
            </h1>
          </div>
        </Container>
        <div style={styles.animatedCircle1}></div>
        <div style={styles.animatedCircle2}></div>
        <div style={styles.animatedCircle3}></div>
      </header>

      <Container className="mt-5">
        {loading && subscriptions.length === 0 ? (
          <div style={styles.centerContent}>
            <Spinner animation="border" variant="primary" style={{width: '60px', height: '60px'}} />
            <p className="mt-3" style={{fontSize: '18px', color: '#666'}}>Loading amazing plans...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center" style={styles.errorAlert}>
            {error}
          </Alert>
        ) : (
          <>
            <Row className="justify-content-center">
              {subscriptions.map((sub, index) => (
                <Col key={sub.id} xs={12} md={6} lg={4} className="mb-4">
                  <Card style={{
                    ...styles.pricingCard,
                    transform: index === 1 ? 'scale(1.05)' : 'scale(1)',
                    zIndex: index === 1 ? 2 : 1
                  }} className="h-100">
                    {index === 1 && (
                      <div style={styles.popularBadge}>
                        <Star size={14} fill="#fff" style={{marginRight: '5px'}} />
                        MOST POPULAR
                      </div>
                    )}
                    <Card.Body style={styles.cardBody}>
                      <div style={styles.planHeader}>
                        <h3 style={styles.planTitle}>{sub.month} Month{sub.month > 1 ? 's' : ''}</h3>
                        <div style={styles.priceContainer}>
                          <span style={styles.originalPrice}>₹{sub.price}</span>
                          <div style={styles.finalPriceRow}>
                            <span style={styles.finalPrice}>₹{sub.finalPrice}</span>
                            <Badge bg="success" style={styles.discountBadge}>
                              {sub.discountPercent}% OFF
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div style={styles.planDetails}>
                        <div style={styles.detailRow}>
                          <CheckCircle size={18} color="#10b981" />
                          <span><strong>{sub.totalDays}</strong> Total Days</span>
                        </div>
                        <div style={styles.detailRow}>
                          <CheckCircle size={18} color="#10b981" />
                          <span><strong>{sub.extraDays}</strong> Bonus Days</span>
                        </div>
                        <div style={styles.detailRow}>
                          <CheckCircle size={18} color="#10b981" />
                          <span>Full Feature Access</span>
                        </div>
                      </div>

                      <Button
                        style={index === 1 ? styles.primaryButton : styles.secondaryButton}
                        className="w-100 mt-3"
                        onClick={() => handlePurchaseClick(sub)}
                      >
                        Get Started Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Benefits Section */}
            <div style={styles.benefitsSection}>
              <h2 style={styles.sectionTitle}>What's Included in Super User Subscription?</h2>
              <Row className="mt-4">
                {benefits.map((benefit, index) => (
                  <Col key={index} xs={12} sm={6} lg className="mb-4">
                    <Card style={styles.benefitCard}>
                      <Card.Body className="text-center p-4">
                        <div style={{...styles.benefitIcon, backgroundColor: benefit.color + '20', color: benefit.color}}>
                          {benefit.icon}
                        </div>
                        <h5 style={styles.benefitTitle}>{benefit.title}</h5>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* How to Use Super User ID Section */}
            <div style={styles.usageSection}>
              <div style={styles.usageHeader}>
                <Key size={32} color="#667eea" />
                <h2 style={styles.usageSectionTitle}>How to Use Your Super User ID</h2>
              </div>
              <p style={styles.usageSubtitle}>Follow these simple steps to unlock all premium features with your 6-digit Super User ID</p>
              
              <Row className="mt-5">
                {usageSteps.map((step, index) => (
                  <Col key={index} xs={12} md={6} className="mb-4">
                    <div style={styles.usageCard}>
                      <div style={styles.usageCardHeader}>
                        <div style={{...styles.stepNumber, backgroundColor: step.color}}>
                          {step.number}
                        </div>
                        <div style={{...styles.stepIcon, color: step.color}}>
                          {step.icon}
                        </div>
                      </div>
                      <h4 style={styles.stepTitle}>{step.title}</h4>
                      <p style={styles.stepDescription}>{step.description}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Important Notes Section */}
            <div style={styles.notesSection}>
              <div style={styles.notesHeader}>
                <AlertCircle size={28} color="#0d6efd" />
                <h3 style={styles.notesTitle}>Important Information</h3>
              </div>
              <Row className="mt-4">
                <Col md={6} className="mb-3">
                  <div style={styles.noteCard}>
                    <div style={styles.noteIcon}>🔒</div>
                    <div>
                      <h6 style={styles.noteHeading}>Non-Refundable</h6>
                      <p style={styles.noteText}>Once purchased, super user subscriptions are non-refundable.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div style={styles.noteCard}>
                    <div style={styles.noteIcon}>🎫</div>
                    <div>
                      <h6 style={styles.noteHeading}>Reusable User ID</h6>
                      <p style={styles.noteText}>Your User ID can be used for future purchases without re-registration.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div style={styles.noteCard}>
                    <div style={styles.noteIcon}>⏰</div>
                    <div>
                      <h6 style={styles.noteHeading}>Auto Expiry</h6>
                      <p style={styles.noteText}>Super user access will expire automatically after the subscription period.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div style={styles.noteCard}>
                    <div style={styles.noteIcon}>🔐</div>
                    <div>
                      <h6 style={styles.noteHeading}>Keep ID Safe</h6>
                      <p style={styles.noteText}>Keep your 6-digit User ID safe for future transactions.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div style={styles.noteCard}>
                    <div style={styles.noteIcon}>💬</div>
                    <div>
                      <h6 style={styles.noteHeading}>24/7 Support</h6>
                      <p style={styles.noteText}>For support or queries, contact our help center anytime.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div style={styles.noteCard}>
                    <div style={styles.noteIcon}>🔑</div>
                    <div>
                      <h6 style={styles.noteHeading}>Lost User ID?</h6>
                      <p style={styles.noteText}>If you lose your User ID, contact admin team for instant recovery.</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Container>

      {/* Registration Modal */}
      <Modal 
        show={showRegistrationModal} 
        onHide={() => setShowRegistrationModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{fontSize: '24px', fontWeight: '700'}}>
            <Users size={24} style={{marginRight: '10px'}} />
            User Registration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedSubscription && (
            <Alert style={styles.planAlert}>
              <div style={styles.planAlertContent}>
                <div>
                  <strong>Selected Plan:</strong> {selectedSubscription.month}-Month Plan
                </div>
                <div>
                  <strong>Amount:</strong> <span style={{fontSize: '20px', color: '#10b981'}}>₹{selectedSubscription.finalPrice}</span>
                </div>
                <div>
                  <strong>Validity:</strong> {selectedSubscription.totalDays} days
                </div>
              </div>
            </Alert>
          )}

          <Form.Group className="mb-4">
            <Form.Label style={styles.formLabel}>
              Have a User ID? <Badge bg="info">Optional</Badge>
            </Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={userId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    setUserId(value);
                  }
                }}
                placeholder="Enter 6-digit User ID"
                inputMode="numeric"
                maxLength={6}
                style={styles.formInput}
              />
              <Button 
                variant="secondary" 
                onClick={handleUserIdCheck}
                disabled={isCheckingUser || userId.length !== 6}
                style={{minWidth: '120px', fontWeight: '600'}}
              >
                {isCheckingUser ? <Spinner size="sm" /> : "Verify ID"}
              </Button>
            </div>
            <Form.Text className="text-muted">
              If you have purchased before, enter your User ID to auto-fill details
            </Form.Text>
          </Form.Group>

          {isExistingUser && (
            <Alert variant="success" style={styles.successAlert}>
              <CheckCircle size={20} style={{marginRight: '10px'}} />
              User ID verified! Your details have been loaded.
            </Alert>
          )}

          <Form>
            <Row>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label style={styles.formLabel}>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={userFormData.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  style={styles.formInput}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label style={styles.formLabel}>Age *</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={userFormData.age}
                  onChange={handleFormChange}
                  min="10"
                  max="100"
                  placeholder="Enter age"
                  style={styles.formInput}
                  required
                />
              </Form.Group>
            </Row>

            <Row>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label style={styles.formLabel}>Gender *</Form.Label>
                <Form.Select
                  name="gender"
                  value={userFormData.gender}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label style={styles.formLabel}>Phone Number *</Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNo"
                  value={userFormData.phoneNo}
                  onChange={handleFormChange}
                  pattern="[0-9]{10}"
                  placeholder="10-digit phone number"
                  maxLength={10}
                  style={styles.formInput}
                  required
                />
              </Form.Group>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>
                Email <Badge bg="secondary">Optional</Badge>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userFormData.email}
                onChange={handleFormChange}
                placeholder="Enter email address"
                style={styles.formInput}
              />
            </Form.Group>

            <Row>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label style={styles.formLabel}>District *</Form.Label>
                <Form.Control
                  type="text"
                  name="district"
                  value={userFormData.district}
                  onChange={handleFormChange}
                  placeholder="Enter district"
                  style={styles.formInput}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label style={styles.formLabel}>State *</Form.Label>
                <Form.Select
                  name="state"
                  value={userFormData.state}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  required
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
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="light" onClick={() => setShowRegistrationModal(false)} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button 
            style={styles.proceedButton}
            onClick={handleProceedToPurchase}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="me-2" /> : null}
            Proceed to Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header style={styles.successModalHeader}>
          <Modal.Title style={{fontSize: '24px', fontWeight: '700'}}>
            <CheckCircle size={28} style={{marginRight: '10px'}} />
            Purchase Successful!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {purchasedUserDetails && selectedSubscription && (
            <div>
              <Alert style={styles.celebrationAlert}>
                <div style={styles.celebrationContent}>
                  🎉 <strong>Congratulations!</strong> Your super user subscription is now active!
                </div>
              </Alert>
              
              <div style={styles.purchaseDetails}>
                <div style={styles.purchaseDetailRow}>
                  <span style={styles.detailLabel}>Name:</span>
                  <span style={styles.detailValue}>{purchasedUserDetails.name}</span>
                </div>
                <div style={styles.purchaseDetailRow}>
                  <span style={styles.detailLabel}>User ID:</span>
                  <Badge style={styles.userIdBadge}>
                    {purchasedUserDetails.userId}
                  </Badge>
                </div>
                <div style={styles.purchaseDetailRow}>
                  <span style={styles.detailLabel}>Plan:</span>
                  <span style={styles.detailValue}>{selectedSubscription.month}-Month Plan</span>
                </div>
                <div style={styles.purchaseDetailRow}>
                  <span style={styles.detailLabel}>Amount Paid:</span>
                  <span style={styles.amountPaid}>₹{selectedSubscription.finalPrice}</span>
                </div>
                <div style={styles.purchaseDetailRow}>
                  <span style={styles.detailLabel}>Valid Until:</span>
                  <span style={styles.expiryDate}>{purchaseExpiry && formatDate(purchaseExpiry)}</span>
                </div>
              </div>
              
              <Alert style={styles.downloadAlert}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Download size={20} style={{marginRight: '10px', color: '#0d6efd'}} />
                  <div>
                    <strong>Receipt Downloaded!</strong>
                    <br />
                    <small>Your purchase receipt has been downloaded automatically. Keep your User ID <strong>{purchasedUserDetails.userId}</strong> safe for future purchases!</small>
                  </div>
                </div>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.successModalFooter}>
          <Button 
            style={styles.closeSuccessButton}
            onClick={() => {
              setShowSuccessModal(false);
              window.location.reload();
            }}
          >
            Close & Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer style={styles.footer}>
        <Container>
          <div style={styles.footerContent}>
            <p style={styles.footerText}>&copy; 2025/2026 Karnataka Ayan Wholesale Supply Enterprises. All Rights Reserved.</p>
            <p style={styles.footerSubtext}>Empowering Minds, Developing India.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    paddingBottom: "0",
  },
  heroHeader: {
    background: "#2c3e50",
    color: "#fff",
    padding: "30px 0 35px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(13, 110, 253, 0.3)",
  },
  heroContent: {
    textAlign: "center",
    position: "relative",
    zIndex: 2,
    animation: "fadeInUp 0.8s ease-out",
  },
  badgeContainer: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "6px 16px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
    backdropFilter: "blur(10px)",
    animation: "pulse 2s ease-in-out infinite",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "0",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  superText: {
    background: "linear-gradient(45deg, #FFD700, #FFA500, #FFD700)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "shimmer 3s linear infinite",
    fontWeight: "900",
    textShadow: "none",
    filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
  },
  userText: {
    color: "#fff",
    fontWeight: "700",
  },
  subscriptionsText: {
    background: "linear-gradient(45deg, #fff, #e0e0e0, #fff)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "shimmer 3s linear infinite",
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: "16px",
    opacity: "0.95",
    marginBottom: "0",
    fontWeight: "400",
  },
  starRating: {
    display: "none",
  },
  pricingCard: {
    borderRadius: "24px",
    border: "2px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    background: "#ffffff",
  },
  popularBadge: {
    position: "absolute",
    top: "20px",
    right: "-35px",
    backgroundColor: "#f59e0b",
    color: "#fff",
    padding: "6px 40px",
    fontSize: "11px",
    fontWeight: "700",
    transform: "rotate(45deg)",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.4)",
  },
  cardBody: {
    padding: "35px 25px",
  },
  planHeader: {
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "20px",
    marginBottom: "20px",
  },
  planTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "15px",
  },
  priceContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  originalPrice: {
    fontSize: "18px",
    color: "#94a3b8",
    textDecoration: "line-through",
    fontWeight: "500",
  },
  finalPriceRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  finalPrice: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#10b981",
  },
  discountBadge: {
    fontSize: "14px",
    padding: "6px 12px",
    fontWeight: "700",
  },
  planDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    color: "#475569",
  },
  primaryButton: {
    backgroundColor: "#667eea",
    border: "none",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  secondaryButton: {
    backgroundColor: "#0d6efd",
    border: "none",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(13, 110, 253, 0.3)",
    transition: "all 0.3s ease",
  },
  updatedText: {
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "15px",
    fontWeight: "500",
  },
  benefitsSection: {
    marginTop: "80px",
    marginBottom: "60px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "10px",
    position: "relative",
    display: "inline-block",
  },
  benefitCard: {
    border: "none",
    borderRadius: "20px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
    transition: "all 0.3s ease",
    height: "100%",
  },
  benefitIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "28px",
  },
  benefitTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginTop: "10px",
  },
  usageSection: {
    marginTop: "80px",
    marginBottom: "60px",
    padding: "60px 40px",
    backgroundColor: "#fff",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  usageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "15px",
  },
  usageSectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    textAlign: "center",
  },
  usageSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 0,
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  usageCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    padding: "30px",
    height: "100%",
    border: "2px solid #e2e8f0",
    transition: "all 0.4s ease",
    position: "relative",
    overflow: "hidden",
  },
  usageCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  stepNumber: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
  },
  stepIcon: {
    opacity: 0.2,
    transition: "all 0.3s ease",
  },
  stepTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
  },
  stepDescription: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.7",
    marginBottom: "15px",
  },
  stepArrow: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    opacity: 0.3,
    transition: "all 0.3s ease",
  },
  usageAlert: {
    backgroundColor: "#f0f4ff",
    border: "2px solid #667eea",
    borderRadius: "16px",
    padding: "25px",
    marginTop: "40px",
  },
  usageAlertContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
  },
  notesSection: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "50px 40px",
    marginTop: "60px",
    marginBottom: "60px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  notesHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  notesTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
  },
  noteCard: {
    display: "flex",
    gap: "15px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    transition: "all 0.3s ease",
    height: "100%",
  },
  noteIcon: {
    fontSize: "32px",
    flexShrink: 0,
  },
  noteHeading: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "5px",
  },
  noteText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: 0,
    lineHeight: "1.6",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    padding: "20px 25px",
  },
  planAlert: {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    borderRadius: "12px",
    padding: "15px",
  },
  planAlertContent: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  formLabel: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "14px",
    marginBottom: "8px",
  },
  formInput: {
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    padding: "12px",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  successAlert: {
    backgroundColor: "#f0fdf4",
    border: "2px solid #10b981",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
    color: "#166534",
  },
  modalFooter: {
    padding: "20px 25px",
    borderTop: "2px solid #f1f5f9",
  },
  cancelButton: {
    padding: "12px 30px",
    fontWeight: "700",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    color: "#64748b",
  },
  proceedButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    padding: "12px 30px",
    fontWeight: "700",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  successModalHeader: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    padding: "20px 25px",
  },
  celebrationAlert: {
    backgroundColor: "#f0fdf4",
    border: "2px solid #10b981",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "25px",
  },
  celebrationContent: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
  },
  purchaseDetails: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "20px",
  },
  purchaseDetailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  detailLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#64748b",
  },
  detailValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
  },
  userIdBadge: {
    backgroundColor: "#667eea",
    fontSize: "18px",
    padding: "8px 20px",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  amountPaid: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#10b981",
  },
  expiryDate: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#dc2626",
  },
  downloadAlert: {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    borderRadius: "12px",
    padding: "15px",
  },
  successModalFooter: {
    padding: "20px 25px",
    borderTop: "2px solid #f1f5f9",
    justifyContent: "center",
  },
  closeSuccessButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    padding: "12px 40px",
    fontWeight: "700",
    borderRadius: "10px",
    fontSize: "16px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
  },
  footer: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "40px 0",
    marginTop: "80px",
  },
  footerContent: {
    textAlign: "center",
  },
  footerText: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  footerSubtext: {
    fontSize: "14px",
    opacity: "0.8",
    marginBottom: 0,
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  errorAlert: {
    borderRadius: "16px",
    padding: "20px",
    fontSize: "16px",
    fontWeight: "600",
  },
};