import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Globe,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import API_BASE_URL from './ApiConfigCourse';
import logo from '../Images/LOGO.jpg';

const CourseApplicationForm = ({ course }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    age: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const errorRef = useRef(null);

  const scrollToError = () => {
    errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const generateApplicationId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours);
    
    if (hours12 >= 12) {
      period = 'PM';
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    if (hours12 === 0) {
      hours12 = 12;
    }
    
    return `${hours12}:${minutes} ${period}`;
  };

  const validateForm = () => {
    let errorMessage = '';
    if (!formData.name.trim()) errorMessage = 'Name is required';
    if (!formData.phone.trim()) errorMessage = 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phone)) errorMessage = 'Invalid phone number. Must be 10 digits';
    if (!formData.address.trim()) errorMessage = 'Address is required';
    if (!formData.city.trim()) errorMessage = 'City is required';
    if (!formData.state.trim()) errorMessage = 'State is required';
    if (!/^\d{6}$/.test(formData.pincode)) errorMessage = 'Invalid pincode. Must be 6 digits';
    if (!formData.age) errorMessage = 'Age is required';
    const age = parseInt(formData.age);
    if (isNaN(age) || age <= 0 || age > 120) errorMessage = 'Please enter a valid age (1-120)';
    
    if (errorMessage) {
      setError(errorMessage);
      setTimeout(scrollToError, 100);
      return true;
    }
    return false;
  };

  const generatePDF = (appId, applicationData) => {
    try {
      const doc = new jsPDF();
      
      const headerColor = [63, 81, 181];
      const textColor = [0, 0, 0];
      
      doc.setFillColor(...headerColor);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      const logoWidth = 30;
      const logoHeight = 30;
      doc.addImage(logo, 'JPEG', 15, 5, logoWidth, logoHeight);
      
      doc.setFontSize(24);
      doc.text('Success Online Course', logoWidth + 25, 25);
      
      doc.setFontSize(14);
      doc.setTextColor(...textColor);
      doc.text('Your Gateway to Success in Online Learning', doc.internal.pageSize.width / 2, 50, {
        align: 'center'
      });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Application Details', 15, 70);
      
      const details = [
        ['Application ID:', appId],
        ['Course Name:', course.title],
        ['Course Fee:', `${course.fees}/- INR`],
        ['Start Date:', formatDate(course.startDate)],
        ['Timing:', `${formatTime(course.startTime)} - ${formatTime(course.endTime)}`],
        ['Last Date to Apply:', formatDate(course.lastDateToApply)],
        ['Name:', applicationData.name],
        ['Email:', applicationData.email || 'N/A'],
        ['Phone:', applicationData.phone],
        ['Age:', applicationData.age],
        ['Address:', applicationData.address],
        ['City:', applicationData.city],
        ['State:', applicationData.state],
        ['Pincode:', applicationData.pincode],
        ['Application Date:', formatDate(new Date())]
      ];
      
      let y = 80;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 255);
        doc.text(`${label}`, 15, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.text(`${value}`, 90, y);
        y += 10;
      });
      
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 15, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const instructions = [
        '1. This is the computer-generated copy of your application.',
        '2. If fees is not paid before the last date, your application will be rejected.',
        '3. Please hold on; we will contact you within 2 days for fee payment and other details.',
        '4. After fee payment, check the application status for further information.',
        '5. For any further assistance, reach out to us from the help section on the home page.'
      ];
      
      instructions.forEach((instruction) => {
        doc.text(instruction, 15, y);
        y += 10;
      });
      
      const fileName = `${applicationData.name}_CourseApplication.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      scrollToError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowNotification(false);
    
    if (validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const newApplicationId = generateApplicationId();
      setApplicationId(newApplicationId);
      
      const applicationData = {
        applicationId: newApplicationId,
        courseId: course.id,
        courseName: course.title,
        courseFees: course.fees,
        ...formData,
        applicationDate: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (data.success) {
        generatePDF(newApplicationId, formData);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          age: ''
        });
      } else {
        setError('Failed to submit application. Please try again.');
        scrollToError();
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      scrollToError();
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container py-5 position-relative">
      <div className="card shadow-lg">
        <div className="card-header text-white" style={{backgroundColor: "#005f73"}}>
          <h3 className="mb-0">Course Application Form</h3>
        </div>
        <div className="card-body">
          {/* Error Message */}
          {error && (
            <div 
              ref={errorRef}
              className="alert alert-danger"
              role="alert"
              style={{ scrollMarginTop: '100px' }}
            >
              {error}
            </div>
          )}

          {/* Course Details Section */}
          <div className="mb-4 p-3 bg-light rounded">
            <h4 className="text-primary mb-3">Course Details</h4>
            <div className="row">
              <div className="col-md-3">
                <p className="mb-1"><strong>Course Name:</strong></p>
                <p>{course.title}</p>
              </div>
              <div className="col-md-3">
                <p className="mb-1"><strong>Course Fee:</strong></p>
                <p>₹{course.fees}</p>
              </div>
              <div className="col-md-3">
                <p className="mb-1"><strong>Start Date:</strong></p>
                <p>{formatDate(course.startDate)}</p>
              </div>
              <div className="col-md-3">
                <p className="mb-1"><strong>Last Date to Apply:</strong></p>
                <p>{formatDate(course.lastDateToApply)}</p>
              </div>
              <div className="col-md-3">
                <p className="mb-1"><strong>Timing:</strong></p>
                <p>{formatTime(course.startTime)} - {formatTime(course.endTime)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Name */}
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="name">
                    <User className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    Full Name
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <label htmlFor="email">
                    <Mail className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    Email (Optional)
                  </label>
                </div>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    required
                  />
                  <label htmlFor="phone">
                    <Phone className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    Phone Number
                  </label>
                </div>
              </div>

              {/* Age */}
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    className="form-control"
                    id="age"
                    name="age"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    required
                  />
                  <label htmlFor="age">
                    <Clock className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    Age
                  </label>
                </div>
              </div>

              {/* Address */}
              <div className="col-12">
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    style={{ height: '100px' }}
                    required
                  />
                  <label htmlFor="address">
                    <MapPin className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    Address
                  </label>
                </div>
              </div>

              {/* City */}
              <div className="col-md-4">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="city">
                    <Building2 className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    City
                  </label>
                </div>
              </div>

              {/* State */}
              <div className="col-md-4">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="state"
                    name="state"
                    placeholder="Enter your state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="state">
                    <Globe className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    State
                  </label>
                </div>
              </div>

              {/* Pincode */}
              <div className="col-md-4">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="pincode"
                    name="pincode"
                    placeholder="Enter your pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    required
                  />
                  <label htmlFor="pincode">
                    <MapPin className="me-2" size={16} style={{display: 'inline-block', verticalAlign: 'middle'}} />
                    Pincode
                  </label>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Application And Download Details'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Notification */}
      {showNotification && (
        <div 
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1050 }}
        >
          <div 
            className="toast show bg-success text-white"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <strong className="me-auto">Application Submitted!</strong>
              <button 
                type="button" 
                className="btn-close"
                onClick={() => setShowNotification(false)}
              ></button>
            </div>
            <div className="toast-body">
              Application submitted successfully! Your application ID is: {applicationId}, our team will reach you soon!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApplicationForm;