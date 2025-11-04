import React, { useState, useEffect } from 'react';
import { Coins, Download, FilePlus, FileCheck, Book, Calendar, File, Video, Users } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import API_BASE_URL from './ApiConfig';
import logo from "../Images/LOGO.jpg"

export default function GstInvoice() {
  const [fileType, setFileType] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [liveTestData, setLiveTestData] = useState([]);
  const [practiceTestData, setPracticeTestData] = useState([]);
  const [syllabusPdfData, setSyllabusPdfData] = useState([]);
  const [videoSyllabusData, setVideoSyllabusData] = useState([]);
  const [superUserData, setSuperUserData] = useState([]);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [processedInvoices, setProcessedInvoices] = useState(0);
  const [downloadMode, setDownloadMode] = useState('individual');

  const fileOptions = ['Live Test', 'Practice Test', 'Syllabus PDF', 'Video Syllabus', 'Super User Subscription', 'All'];
  const monthOptions = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December', 'All'
  ];
  
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear; i++) {
    yearOptions.push(i);
  }

  const containerStyle = {
    maxWidth: '800px',
    margin: '50px auto',
    background: 'linear-gradient(135deg, #e6f0ff, #ffffff)',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0, 123, 255, 0.15)',
    padding: '35px 30px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#0056b3'
  };

  const buttonStyle = {
    marginTop: '15px',
    width: '100%',
    background: 'linear-gradient(to right, #007bff, #3399ff)',
    border: 'none',
    color: 'white',
    padding: '12px 20px',
    fontSize: '17px',
    borderRadius: '12px',
    fontWeight: '500',
    boxShadow: '0 4px 10px rgba(0,123,255,0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  };

  const buttonHoverStyle = {
    background: 'linear-gradient(to right, #0056b3, #007bff)',
    boxShadow: '0 6px 12px rgba(0,123,255,0.45)'
  };

  const labelStyle = {
    fontWeight: '500',
    color: '#003d80'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,123,255,0.1)',
    marginBottom: '20px'
  };

  const statBoxStyle = {
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    background: '#f8f9fa',
    border: '1px solid #dee2e6'
  };

  const [isHover, setIsHover] = useState(false);
  const [isHoverCombined, setIsHoverCombined] = useState(false);

  useEffect(() => {
    if (fileType && month) {
      fetchData();
    }
  }, [fileType, month, year]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For Live Test
      if (fileType === 'Live Test' || fileType === 'All') {
        const liveResponse = await axios.get(`${API_BASE_URL}/api/candidates`);
        
        const paidCandidates = liveResponse.data.candidates.filter(
          candidate => candidate.payment && 
          candidate.payment.status === 'completed' && 
          parseFloat(candidate.payment.paymentAmount) > 0
        );
        
        setLiveTestData(paidCandidates);
      }
      
      // For Practice Test
      if (fileType === 'Practice Test' || fileType === 'All') {
        const practiceResponse = await axios.get(`${API_BASE_URL}/api/practicetestpurchasedstudents`);
        
        const allPracticeTestPurchases = [];
        
        if (practiceResponse.data.success) {
          Object.keys(practiceResponse.data.data).forEach(userId => {
            const userData = practiceResponse.data.data[userId];
            
            if (userData.purchases && Array.isArray(userData.purchases)) {
              userData.purchases.forEach(purchase => {
                if (purchase.paymentDetails && 
                    purchase.paymentDetails.status === 'captured' && 
                    parseFloat(purchase.paymentDetails.amount) > 0) {
                  
                  allPracticeTestPurchases.push({
                    userId,
                    name: userData.name || 'N/A',
                    phoneNo: userData.phoneNo || 'N/A',
                    district: userData.district || 'N/A',
                    state: userData.state || 'N/A',
                    email: userData.email || 'N/A',
                    purchaseDate: purchase.purchaseDate,
                    paymentStatus: 'completed',
                    paymentAmount: purchase.paymentDetails.amount,
                    paymentId: purchase.paymentDetails.paymentId,
                    orderId: purchase.paymentDetails.orderId,
                    syllabusTitle: purchase.examDetails?.title || 'Practice Test',
                    syllabusCategory: purchase.examDetails?.category || 'N/A',
                    syllabusDuration: purchase.examDetails?.duration || 'N/A'
                  });
                }
              });
            } else if (userData.purchases) {
              Object.keys(userData.purchases).forEach(purchaseId => {
                const purchase = userData.purchases[purchaseId];
                
                if (purchase.paymentStatus === 'completed' && parseFloat(purchase.paymentAmount) > 0) {
                  allPracticeTestPurchases.push({
                    userId,
                    purchaseId,
                    name: userData.name || 'N/A',
                    phoneNo: userData.phoneNo || 'N/A',
                    district: userData.district || 'N/A',
                    state: userData.state || 'N/A',
                    email: userData.email || 'N/A',
                    ...purchase
                  });
                }
              });
            }
          });
        }
        
        setPracticeTestData(allPracticeTestPurchases);
      }
      
      // For Syllabus PDF
      if (fileType === 'Syllabus PDF' || fileType === 'All') {
        const syllabusResponse = await axios.get(`${API_BASE_URL}/api/pdfsyllabuspurchasers`);
        
        const allSyllabusPurchases = [];
        if (syllabusResponse.data.success) {
          Object.keys(syllabusResponse.data.data).forEach(userId => {
            const userData = syllabusResponse.data.data[userId];
            
            if (userData.purchases) {
              if (Array.isArray(userData.purchases)) {
                userData.purchases.forEach(purchase => {
                  if (purchase.paymentDetails && 
                      purchase.paymentDetails.status === 'captured' && 
                      parseFloat(purchase.paymentDetails.amount) > 0) {
                    
                    allSyllabusPurchases.push({
                      userId,
                      name: userData.name || 'N/A',
                      phoneNo: userData.phoneNo || 'N/A',
                      district: userData.district || 'N/A',
                      state: userData.state || 'N/A',
                      email: userData.email || 'N/A',
                      purchaseDate: purchase.purchaseDate,
                      paymentStatus: 'completed',
                      paymentAmount: purchase.paymentDetails.amount,
                      paymentId: purchase.paymentDetails.paymentId,
                      orderId: purchase.paymentDetails.orderId,
                      syllabusTitle: purchase.syllabusDetails?.title || 'Syllabus',
                      syllabusCategory: purchase.syllabusDetails?.category || 'N/A',
                      syllabusDuration: purchase.syllabusDetails?.duration || 'N/A'
                    });
                  }
                });
              } else {
                Object.keys(userData.purchases).forEach(purchaseId => {
                  const purchase = userData.purchases[purchaseId];
                  
                  if (purchase.paymentStatus === 'completed' && parseFloat(purchase.paymentAmount) > 0) {
                    allSyllabusPurchases.push({
                      userId,
                      purchaseId,
                      name: userData.name || 'N/A',
                      phoneNo: userData.phoneNo || 'N/A',
                      district: userData.district || 'N/A',
                      state: userData.state || 'N/A',
                      email: userData.email || 'N/A',
                      ...purchase
                    });
                  }
                });
              }
            }
          });
        }
        
        setSyllabusPdfData(allSyllabusPurchases);
      }
      
      // For Video Syllabus
      if (fileType === 'Video Syllabus' || fileType === 'All') {
        const videoSyllabusResponse = await axios.get(`${API_BASE_URL}/api/videosyllabuspurchasers`);
        
        const allVideoSyllabusPurchases = [];
        if (videoSyllabusResponse.data.success) {
          Object.keys(videoSyllabusResponse.data.data).forEach(userId => {
            const userData = videoSyllabusResponse.data.data[userId];
            
            if (userData.purchases) {
              Object.keys(userData.purchases).forEach(purchaseId => {
                const purchase = userData.purchases[purchaseId];
                
                if (purchase.paymentStatus === 'completed' && parseFloat(purchase.paymentAmount) > 0) {
                  allVideoSyllabusPurchases.push({
                    userId,
                    purchaseId,
                    name: userData.name || 'N/A',
                    phoneNo: userData.phoneNo || 'N/A',
                    district: userData.district || 'N/A',
                    state: userData.state || 'N/A',
                    email: userData.email || 'N/A',
                    purchaseDate: purchase.purchaseDate || purchase.createdAt,
                    paymentStatus: 'completed',
                    paymentAmount: purchase.paymentAmount,
                    paymentId: purchase.paymentId || `VS-${purchaseId.substring(0, 8)}`,
                    orderId: purchase.orderId || `VS-ORDER-${purchaseId.substring(0, 8)}`,
                    syllabusTitle: purchase.syllabusTitle || 'Video Syllabus',
                    syllabusCategory: purchase.syllabusCategory || 'N/A',
                    syllabusDuration: purchase.syllabusDuration || 'N/A',
                    syllabusDescription: purchase.syllabusDescription || '',
                    syllabusFilePath: purchase.syllabusFilePath || '',
                    syllabusFileUrl: purchase.syllabusFileUrl || '',
                    syllabusPrice: purchase.syllabusPrice || 0
                  });
                }
              });
            }
          });
        }
        
        setVideoSyllabusData(allVideoSyllabusPurchases);
      }
      
      // For Super User Subscription
      if (fileType === 'Super User Subscription' || fileType === 'All') {
        const superUserResponse = await axios.get(`${API_BASE_URL}/api/super-user-all`);
        
        const allSuperUserPurchases = [];
        if (superUserResponse.data.success) {
          superUserResponse.data.purchasers.forEach(purchaser => {
            const userData = purchaser.userDetails;
            
            if (purchaser.purchases) {
              Object.keys(purchaser.purchases).forEach(purchaseId => {
                const purchase = purchaser.purchases[purchaseId];
                
                // Only include completed payments with amount > 0
                if (purchase.paymentDetails && 
                    purchase.paymentDetails.status === 'completed' && 
                    parseFloat(purchase.paymentDetails.amount) > 0) {
                  
                  allSuperUserPurchases.push({
                    userId: purchaser.userId,
                    purchaseId,
                    name: userData.name || 'N/A',
                    phoneNo: userData.phoneNo || 'N/A',
                    district: userData.district || 'N/A',
                    state: userData.state || 'N/A',
                    email: userData.email || 'N/A',
                    age: userData.age || 'N/A',
                    gender: userData.gender || 'N/A',
                    purchaseDate: purchase.purchaseDate,
                    paymentStatus: 'completed',
                    paymentAmount: purchase.paymentDetails.amount,
                    paymentId: purchase.paymentDetails.paymentId,
                    orderId: purchase.paymentDetails.orderId,
                    subscriptionMonth: purchase.subscriptionDetails?.month || 'N/A',
                    subscriptionPrice: purchase.subscriptionDetails?.price || '0',
                    subscriptionDiscount: purchase.subscriptionDetails?.discountPercent || '0',
                    subscriptionFinalPrice: purchase.subscriptionDetails?.finalPrice || 0,
                    subscriptionTotalDays: purchase.subscriptionDetails?.totalDays || 0,
                    subscriptionExtraDays: purchase.subscriptionDetails?.extraDays || '0',
                    expiryDate: purchase.expiryDate,
                    isActive: purchase.isActive || false,
                    createdAt: purchase.createdAt
                  });
                }
              });
            }
          });
        }
        
        setSuperUserData(allSuperUserPurchases);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterByMonth = (data, selectedMonth, selectedYear) => {
    if (!data || data.length === 0) return [];
    
    if (selectedMonth === 'All') {
      if (selectedYear === 'All') {
        return data;
      }
      return data.filter(item => {
        const purchaseDate = item.purchaseDate || 
                             (item.payment && item.payment.paymentDate) || 
                             item.createdAt;
        const date = new Date(purchaseDate);
        return date.getFullYear() === parseInt(selectedYear);
      });
    }
    
    const monthIndex = monthOptions.findIndex(m => m === selectedMonth);
    
    return data.filter(item => {
      const purchaseDate = item.purchaseDate || 
                           (item.payment && item.payment.paymentDate) || 
                           item.createdAt;
      const date = new Date(purchaseDate);
      
      if (selectedYear === 'All') {
        return date.getMonth() === monthIndex;
      }
      
      return date.getMonth() === monthIndex && 
             date.getFullYear() === parseInt(selectedYear);
    });
  };

  const generateInvoicePage = (pdf, purchaseData, type) => {
    try {
      // Header background
      pdf.setFillColor(0, 82, 165);
      pdf.rect(0, 0, 210, 15, 'F');
      
      // Add logo placeholder
      pdf.addImage(logo, 'PNG', 150, 25, 40, 30);
      
      // Company details
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Karnataka Ayan Wholesale Supply Enterprises', 20, 30);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Karnataka India 580011', 20, 37);
      pdf.text('Phone: +91 6360785195', 20, 44);
      pdf.text('Email: Jubedakbar@gmail.com', 20, 51);
      pdf.text('GSTIN: 29BXYPN0096F1ZS', 20, 58);
      
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
      
      const paymentId = purchaseData.paymentId || 
                       (purchaseData.payment && purchaseData.payment.paymentId) || 
                       'N/A';
      const orderId = purchaseData.orderId || 
                     (purchaseData.payment && purchaseData.payment.orderId) || 
                     'N/A';
      const purchaseDate = new Date(
        purchaseData.purchaseDate || 
        (purchaseData.payment && purchaseData.payment.paymentDate) || 
        purchaseData.createdAt
      );
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Number:', 20, 95);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`INV-${paymentId.substring(0, 8)}`, 60, 95);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', 20, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(purchaseDate.toLocaleDateString('en-IN'), 60, 102);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment ID:', 20, 109);
      pdf.setFont('helvetica', 'normal');
      pdf.text(paymentId, 60, 109);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order ID:', 20, 116);
      pdf.setFont('helvetica', 'normal');
      pdf.text(orderId, 60, 116);
      
      // Customer details
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 120, 95);
      pdf.setFont('helvetica', 'normal');
      pdf.text(purchaseData.name || purchaseData.candidateName || 'N/A', 120, 102);
      pdf.text(purchaseData.email || 'N/A', 120, 109);
      pdf.text(purchaseData.phoneNo || purchaseData.phone || 'N/A', 120, 116);
      pdf.text(`${purchaseData.district || 'N/A'}, ${purchaseData.state || 'N/A'}`, 120, 123);
      
      // GST Note
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 82, 165);
      pdf.setFillColor(230, 240, 255);
      pdf.roundedRect(20, 130, 170, 10, 2, 2, 'F');
      pdf.text('Note: The amount shown below is inclusive of 18% GST.', 25, 137);
      
      // Define table dimensions
      const tableStartX = 20;
      const tableStartY = 145;
      const colWidths = [80, 50, 40];
      const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      const rowHeight = 10;
      
      // Table header
      pdf.setFillColor(0, 82, 165);
      pdf.rect(tableStartX, tableStartY, tableWidth, rowHeight, 'F');
      
      // Draw vertical lines for header
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(tableStartX + colWidths[0], tableStartY, tableStartX + colWidths[0], tableStartY + rowHeight);
      pdf.line(tableStartX + colWidths[0] + colWidths[1], tableStartY, tableStartX + colWidths[0] + colWidths[1], tableStartY + rowHeight);
      
      // Table header text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Description', tableStartX + 5, tableStartY + 7);
      pdf.text('Amount without GST(INR)', tableStartX + colWidths[0] + colWidths[1]/2, tableStartY + 7, { align: 'center' });
      pdf.text('Amount with GST(INR)', tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, tableStartY + 7, { align: 'center' });
      
      // Reset text color and font
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      let currentY = tableStartY + rowHeight;
      
      // Description and price based on type of purchase
      let description = '';
      let price = '';
      
      if (type === 'Live Test') {
        description = `Live Test Registration: ${purchaseData.exam || 'Exam Registration'}`;
        price = purchaseData.payment.paymentAmount;
      } else if (type === 'Practice Test') {
        description = `Practice Test: ${purchaseData.syllabusTitle || 'Test Material'}`;
        price = purchaseData.paymentAmount;
      } else if (type === 'Syllabus PDF') {
        description = `Syllabus PDF: ${purchaseData.syllabusTitle || 'Study Material'}`;
        price = purchaseData.paymentAmount;
      } else if (type === 'Video Syllabus') {
        description = `Video Syllabus: ${purchaseData.syllabusTitle || 'Video Material'}`;
        price = purchaseData.paymentAmount;
      } else if (type === 'Super User Subscription') {
        const months = purchaseData.subscriptionMonth || 'N/A';
        description = `Super User Subscription (${months} Month${months !== '1' ? 's' : ''})`;
        price = purchaseData.paymentAmount;
      }
      
      // Ensure price is a valid number
      const priceValue = parseFloat(price) || 0;
      
      // Calculate amount without GST (82% of total amount, since 18% GST is included)
      const priceWithoutGST = (priceValue * 0.82).toFixed(2);
      const priceWithGST = priceValue.toFixed(2);
      
      // Function to wrap text and return height needed
      const wrapText = (text, maxWidth) => {
        const words = text.split(' ');
        let line = '';
        const lines = [];
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const testWidth = pdf.getStringUnitWidth(testLine) * pdf.getFontSize() / pdf.internal.scaleFactor;
          
          if (testWidth > maxWidth && i > 0) {
            lines.push(line.trim());
            line = words[i] + ' ';
          } else {
            line = testLine;
          }
        }
        
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        
        return { lines, height: lines.length * 7 };
      };
      
      // Wrap description text and calculate row height needed
      const maxDescWidth = colWidths[0] - 10;
      const wrappedDesc = wrapText(description, maxDescWidth);
      const contentRowHeight = Math.max(wrappedDesc.height, rowHeight);
      
      // Draw cell borders for content row
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.2);
      
      // Draw the outline of the content row
      pdf.rect(tableStartX, currentY, tableWidth, contentRowHeight);
      
      // Draw vertical lines for content row
      pdf.line(tableStartX + colWidths[0], currentY, tableStartX + colWidths[0], currentY + contentRowHeight);
      pdf.line(tableStartX + colWidths[0] + colWidths[1], currentY, tableStartX + colWidths[0] + colWidths[1], currentY + contentRowHeight);
      
      // Fill the description cell
      for (let i = 0; i < wrappedDesc.lines.length; i++) {
        pdf.text(wrappedDesc.lines[i], tableStartX + 5, currentY + 7 + (i * 7));
      }
      
      // Fill amount cells
      const amountY = currentY + (contentRowHeight / 2) + 3;
      pdf.text(priceWithoutGST, tableStartX + colWidths[0] + colWidths[1]/2, amountY, { align: 'center' });
      pdf.text(priceWithGST, tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, amountY, { align: 'center' });
      
      currentY += contentRowHeight;
      
      // Additional info based on type
      if (type === 'Live Test' && purchaseData.examDate) {
        pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
        pdf.text(`Exam Date: ${purchaseData.examDate}`, tableStartX + 5, currentY + 7);
        currentY += rowHeight;
        
        if (purchaseData.examStartTime && purchaseData.examEndTime) {
          pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
          pdf.text(`Time: ${purchaseData.examStartTime} to ${purchaseData.examEndTime}`, tableStartX + 5, currentY + 7);
          currentY += rowHeight;
        }
      } else if ((type === 'Practice Test' || type === 'Syllabus PDF' || type === 'Video Syllabus') && purchaseData.syllabusDuration) {
        pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
        pdf.text(`Duration: ${purchaseData.syllabusDuration}`, tableStartX + 5, currentY + 7);
        currentY += rowHeight;
        
        if (purchaseData.syllabusCategory) {
          pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
          pdf.text(`Category: ${purchaseData.syllabusCategory}`, tableStartX + 5, currentY + 7);
          currentY += rowHeight;
        }
      } else if (type === 'Super User Subscription') {
        // Add subscription details
        if (purchaseData.subscriptionTotalDays) {
          pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
          pdf.text(`Total Days: ${purchaseData.subscriptionTotalDays} days`, tableStartX + 5, currentY + 7);
          currentY += rowHeight;
        }
        
        if (purchaseData.subscriptionDiscount && parseFloat(purchaseData.subscriptionDiscount) > 0) {
          pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
          pdf.text(`Discount Applied: ${purchaseData.subscriptionDiscount}%`, tableStartX + 5, currentY + 7);
          currentY += rowHeight;
        }
        
        if (purchaseData.expiryDate) {
          pdf.rect(tableStartX, currentY, tableWidth, rowHeight);
          const expiryDate = new Date(purchaseData.expiryDate).toLocaleDateString('en-IN');
          pdf.text(`Valid Until: ${expiryDate}`, tableStartX + 5, currentY + 7);
          currentY += rowHeight;
        }
      }
      
      currentY += 10;
      
      // Total Amount Box
      pdf.setFillColor(0, 82, 165);
      pdf.rect(tableStartX + colWidths[0], currentY, colWidths[1] + colWidths[2], 15, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Total Amount:', tableStartX + colWidths[0] + 5, currentY + 10);
      pdf.setFontSize(12);
      pdf.text(`INR ${priceWithGST}`, tableStartX + tableWidth - 5, currentY + 10, { align: 'right' });
      
      // Footer with top border
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, 265, 190, 265);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text('This is a computer-generated document.', 105, 272, { align: 'center' });
    } catch (error) {
      console.error('Error generating invoice page:', error);
    }
  };

  const generateIndividualInvoice = (purchaseData, type) => {
    return new Promise((resolve) => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        generateInvoicePage(pdf, purchaseData, type);
        
        const customerName = purchaseData.name || 
                            purchaseData.candidateName || 
                            'Customer';
        const paymentId = purchaseData.paymentId || 
                         (purchaseData.payment && purchaseData.payment.paymentId) || 
                         'N/A';
        const shortId = paymentId.substring(0, 6);
        const purchaseDate = new Date(
          purchaseData.purchaseDate || 
          (purchaseData.payment && purchaseData.payment.paymentDate) || 
          purchaseData.createdAt
        );
        const purchaseDateStr = purchaseDate.toISOString().split('T')[0];
        
        const filename = `Invoice_${type.replace(/\s+/g, '')}_${customerName.replace(/\s+/g, '_')}_${shortId}_${purchaseDateStr}.pdf`;
        
        pdf.save(filename);
        
        setTimeout(() => resolve(), 100);
      } catch (error) {
        console.error('Error generating invoice:', error);
        resolve();
      }
    });
  };

  const generateCombinedInvoicePDF = (filteredData) => {
    return new Promise((resolve) => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        setProcessedInvoices(0);
        setTotalInvoices(filteredData.length);
        
        for (let i = 0; i < filteredData.length; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const item = filteredData[i];
          generateInvoicePage(pdf, item, item.type);
          
          setProcessedInvoices(i + 1);
          setProgress(Math.round(((i + 1) / filteredData.length) * 100));
        }
        
        const monthYearText = month === 'All' ? 'AllMonths' : month;
        const yearText = year === 'All' ? 'AllYears' : year;
        const fileTypeText = fileType === 'All' ? 'AllTypes' : fileType.replace(/\s+/g, '');
        
        const filename = `Combined_Invoices_${fileTypeText}_${monthYearText}_${yearText}.pdf`;
        pdf.save(filename);
        
        resolve();
      } catch (error) {
        console.error('Error generating combined invoice:', error);
        resolve();
      }
    });
  };

  const handleDownloadInvoices = async () => {
    setIsGenerating(true);
    setProcessedInvoices(0);
    
    let filteredData = [];
    
    if (fileType === 'Live Test' || fileType === 'All') {
      const filteredLiveTest = filterByMonth(liveTestData, month, year);
      filteredData = [...filteredData, ...filteredLiveTest.map(item => ({ ...item, type: 'Live Test' }))];
    }
    
    if (fileType === 'Practice Test' || fileType === 'All') {
      const filteredPracticeTest = filterByMonth(practiceTestData, month, year);
      filteredData = [...filteredData, ...filteredPracticeTest.map(item => ({ ...item, type: 'Practice Test' }))];
    }
    
    if (fileType === 'Syllabus PDF' || fileType === 'All') {
      const filteredSyllabusPdf = filterByMonth(syllabusPdfData, month, year);
      filteredData = [...filteredData, ...filteredSyllabusPdf.map(item => ({ ...item, type: 'Syllabus PDF' }))];
    }
    
    if (fileType === 'Video Syllabus' || fileType === 'All') {
      const filteredVideoSyllabus = filterByMonth(videoSyllabusData, month, year);
      filteredData = [...filteredData, ...filteredVideoSyllabus.map(item => ({ ...item, type: 'Video Syllabus' }))];
    }
    
    if (fileType === 'Super User Subscription' || fileType === 'All') {
      const filteredSuperUser = filterByMonth(superUserData, month, year);
      filteredData = [...filteredData, ...filteredSuperUser.map(item => ({ ...item, type: 'Super User Subscription' }))];
    }
    
    setTotalInvoices(filteredData.length);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (downloadMode === 'combined' && filteredData.length > 0) {
        await generateCombinedInvoicePDF(filteredData);
      } else {
        for (let i = 0; i < filteredData.length; i++) {
          const item = filteredData[i];
          await generateIndividualInvoice(item, item.type);
          
          setProcessedInvoices(i + 1);
          setProgress(Math.round(((i + 1) / filteredData.length) * 100));
        }
      }
      
      alert(`Success! ${filteredData.length} invoice(s) ${downloadMode === 'combined' ? 'combined and downloaded' : 'downloaded'}.`);
    } catch (error) {
      console.error('Error generating invoices:', error);
      setError('Failed to generate invoices. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProcessedInvoices(0);
    }
  };
  
  const getLiveTestStats = () => {
    const filteredLiveTest = filterByMonth(liveTestData, month, year);
    
    const total = filteredLiveTest.reduce((acc, item) => {
      const amount = parseFloat(item.payment.paymentAmount);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return {
      count: filteredLiveTest.length,
      total
    };
  };
  
  const getPracticeTestStats = () => {
    const filteredPracticeTest = filterByMonth(practiceTestData, month, year);
    
    const total = filteredPracticeTest.reduce((acc, item) => {
      const amount = parseFloat(item.paymentAmount);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return {
      count: filteredPracticeTest.length,
      total
    };
  };
  
  const getSyllabusPdfStats = () => {
    const filteredSyllabusPdf = filterByMonth(syllabusPdfData, month, year);
    
    const total = filteredSyllabusPdf.reduce((acc, item) => {
      const amount = parseFloat(item.paymentAmount);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return {
      count: filteredSyllabusPdf.length,
      total
    };
  };

  const getVideoSyllabusStats = () => {
    const filteredVideoSyllabus = filterByMonth(videoSyllabusData, month, year);
    
    const total = filteredVideoSyllabus.reduce((acc, item) => {
      const amount = parseFloat(item.paymentAmount);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return {
      count: filteredVideoSyllabus.length,
      total
    };
  };

  const getSuperUserStats = () => {
    const filteredSuperUser = filterByMonth(superUserData, month, year);
    
    const total = filteredSuperUser.reduce((acc, item) => {
      const amount = parseFloat(item.paymentAmount);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return {
      count: filteredSuperUser.length,
      total
    };
  };

  return (
    <div className="container" style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>GST Invoice Download</h2>
          <p className="text-secondary">Generate and download GST invoices for different payment types</p>
        </div>
        <div className="d-flex align-items-center">
          <Coins size={34} color="#0056b3" />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div style={cardStyle}>
            <div className="mb-3">
              <label htmlFor="fileType" className="form-label" style={labelStyle}>
                <FilePlus size={16} className="me-2" />
                Select Invoice Type
              </label>
              <select
                id="fileType"
                className="form-select"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <option value="">Select Type</option>
                {fileOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div style={cardStyle}>
            <div className="mb-3">
              <label htmlFor="month" className="form-label" style={labelStyle}>
                <Calendar size={16} className="me-2" />
                Select Month
              </label>
              <select
                id="month"
                className="form-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {monthOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div style={cardStyle}>
            <div className="mb-3">
              <label htmlFor="year" className="form-label" style={labelStyle}>
                <Calendar size={16} className="me-2" />
                Select Year
              </label>
              <select
                id="year"
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select Year</option>
                <option value="All">All Years</option>
                {yearOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {(fileType && month) && (
        <div>
          <div className="row mb-4">
            <div className="col-md-2">
              <div style={statBoxStyle}>
                <h6 style={{fontSize: '13px'}}>Live Tests</h6>
                {fileType === 'Live Test' || fileType === 'All' ? (
                  <div className="mt-2">
                    <strong>{getLiveTestStats().count}</strong> purchases
                    <br />
                    <strong>₹{getLiveTestStats().total.toFixed(2)}</strong>
                  </div>
                ) : (
                  <div className="text-muted">Not selected</div>
                )}
              </div>
            </div>
            
            <div className="col-md-2">
              <div style={statBoxStyle}>
                <h6 style={{fontSize: '13px'}}>Practice Tests</h6>
                {fileType === 'Practice Test' || fileType === 'All' ? (
                  <div className="mt-2">
                    <strong>{getPracticeTestStats().count}</strong> purchases
                    <br />
                    <strong>₹{getPracticeTestStats().total.toFixed(2)}</strong>
                  </div>
                ) : (
                  <div className="text-muted">Not selected</div>
                )}
              </div>
            </div>
            
            <div className="col-md-2">
              <div style={statBoxStyle}>
                <h6 style={{fontSize: '13px'}}>Syllabus PDFs</h6>
                {fileType === 'Syllabus PDF' || fileType === 'All' ? (
                  <div className="mt-2">
                    <strong>{getSyllabusPdfStats().count}</strong> purchases
                    <br />
                    <strong>₹{getSyllabusPdfStats().total.toFixed(2)}</strong>
                  </div>
                ) : (
                  <div className="text-muted">Not selected</div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div style={statBoxStyle}>
                <h6 style={{fontSize: '13px'}}>Video Syllabus</h6>
                {fileType === 'Video Syllabus' || fileType === 'All' ? (
                  <div className="mt-2">
                    <strong>{getVideoSyllabusStats().count}</strong> purchases
                    <br />
                    <strong>₹{getVideoSyllabusStats().total.toFixed(2)}</strong>
                  </div>
                ) : (
                  <div className="text-muted">Not selected</div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div style={statBoxStyle}>
                <h6 style={{fontSize: '13px'}}>Super User</h6>
                {fileType === 'Super User Subscription' || fileType === 'All' ? (
                  <div className="mt-2">
                    <strong>{getSuperUserStats().count}</strong> purchases
                    <br />
                    <strong>₹{getSuperUserStats().total.toFixed(2)}</strong>
                  </div>
                ) : (
                  <div className="text-muted">Not selected</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-12">
              <div style={cardStyle}>
                <h5 className="mb-3">Download Options</h5>
                <div className="d-flex mb-3">
                  <div className="form-check me-4">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="downloadMode"
                      id="individualMode"
                      checked={downloadMode === 'individual'}
                      onChange={() => setDownloadMode('individual')}
                    />
                    <label className="form-check-label" htmlFor="individualMode">
                      Individual PDFs (one file per invoice)
                    </label>
                  </div>
                  
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="downloadMode"
                      id="combinedMode"
                      checked={downloadMode === 'combined'}
                      onChange={() => setDownloadMode('combined')}
                    />
                    <label className="form-check-label" htmlFor="combinedMode">
                      Combined PDF (all invoices in one file)
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleDownloadInvoices}
                  className="btn"
                  style={{
                    ...buttonStyle,
                    ...(downloadMode === 'individual' && isHover ? buttonHoverStyle : {}),
                    ...(downloadMode === 'combined' && isHoverCombined ? buttonHoverStyle : {})
                  }}
                  onMouseEnter={() => downloadMode === 'individual' ? setIsHover(true) : setIsHoverCombined(true)}
                  onMouseLeave={() => downloadMode === 'individual' ? setIsHover(false) : setIsHoverCombined(false)}
                  disabled={isGenerating || (fileType && month ? false : true)}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {downloadMode === 'combined' 
                        ? 'Generating Combined PDF...' 
                        : `Generating PDFs (${processedInvoices}/${totalInvoices})`}
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      {downloadMode === 'combined' 
                        ? 'Download Combined Invoice PDF' 
                        : 'Download Individual Invoice PDFs'}
                    </>
                  )}
                </button>
                
                {isGenerating && downloadMode === 'individual' && (
                  <div className="mt-3">
                    <div className="progress">
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {progress}%
                      </div>
                    </div>
                    <small className="text-muted mt-1">
                      Processing invoice {processedInvoices} of {totalInvoices}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
        </div>
      )}
      
      <div className="text-center mt-5">
        <h5 className="mb-3">Instructions</h5>
        <div className="card p-3 bg-light">
          <ol className="text-start mb-0">
            <li>Select the type of invoice you want to download</li>
            <li>Choose the month and year for which you want to generate invoices</li>
            <li>Select whether you want individual PDFs or a combined PDF document</li>
            <li>Click the download button to generate and download the invoice(s)</li>
            <li>For larger numbers of invoices, the process may take a few moments</li>
          </ol>
        </div>
      </div>
    </div>
  );
}