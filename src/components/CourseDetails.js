import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  IndianRupee,
  Download,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from './ApiConfigCourse';
import CourseApplicationForm from './CourseApplicationForm';
import CourseHeader from './CourseHeader'; // Import the CourseHeader component

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/courses/${id}`);
        if (response.data) {
          setCourse(response.data);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to fetch course details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" style={{ color: '#005f73' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  const formattedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
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

  // Handle Apply Now button click
  const handleApplyClick = () => {
    setShowForm(true);
    // Smooth scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Use CourseHeader component */}
      <CourseHeader navigate={navigate} />

      <div className="container py-5">
        {/* Back Button - Moved to left side */}
        <div className="d-flex justify-content-start mb-4">
          <button 
            className="btn btn-outline-secondary"
            style={{ 
              borderColor: '#005f73', 
              color: '#005f73',
              fontSize: '1.1rem',
              padding: '0.5rem 1rem'
            }}
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              } else {
                navigate('/coursedashboard');
              }
            }}
          >
            <ArrowLeft className="me-2" size={20} />
            {showForm ? 'Back to Course Details' : 'Back to Courses'}
          </button>
        </div>

        {showForm ? (
          <CourseApplicationForm course={course} />
        ) : (
          <div className="card shadow-lg" style={{ border: '2px solid #e0e0e0', borderRadius: '1rem' }}>
            {/* Course Image */}
            <div className="position-relative" style={{ maxHeight: '300px', overflow: 'hidden' }}>
              {course.imageUrl ? (
                <div className="text-center bg-light" style={{ height: '300px' }}>
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="h-100 w-auto mx-auto"
                    style={{
                      objectFit: 'contain',
                      maxWidth: '100%',
                      borderTopLeftRadius: '1rem',
                      borderTopRightRadius: '1rem'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/api/placeholder/800/400';
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{
                    height: '300px',
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem'
                  }}
                >
                  <p className="text-muted">No image available</p>
                </div>
              )}
            </div>

            <div className="card-body p-4">
              {/* Course Title */}
              <h1 className="card-title mb-4" 
                  style={{ 
                    color: '#005f73', 
                    fontSize: '2.5rem',
                    fontWeight: '600',
                    borderBottom: '3px solid #005f73',
                    paddingBottom: '0.5rem'
                  }}>
                {course.title}
              </h1>

              {/* Course Details */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="info-card mb-3 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: '0.5rem', backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                      <Calendar className="me-3" style={{ color: '#005f73' }} size={24} />
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#005f73' }}>Start Date</div>
                        <div style={{ fontSize: '1.2rem', color: '#333' }}>{formattedDate(course.startDate)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="info-card mb-3 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: '0.5rem', backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                      <Clock className="me-3" style={{ color: '#005f73' }} size={24} />
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#005f73' }}>Timing</div>
                        <div style={{ fontSize: '1.2rem', color: '#333' }}>
                          {formatTime(course.startTime)} - {formatTime(course.endTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-card mb-3 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: '0.5rem', backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                      <Calendar className="me-3" style={{ color: '#005f73' }} size={24} />
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#005f73' }}>Last Date to Apply</div>
                        <div style={{ fontSize: '1.2rem', color: '#333' }}>{formattedDate(course.lastDateToApply)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="info-card mb-3 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: '0.5rem', backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                      <IndianRupee className="me-3" style={{ color: '#005f73' }} size={24} />
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#005f73' }}>Course Fee</div>
                        <div style={{ fontSize: '1.2rem', color: '#333' }}>₹{course.fees}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div className="mb-4 p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '0.5rem', backgroundColor: '#fff' }}>
                <h4 className="mb-3" style={{ color: '#005f73', fontSize: '1.5rem', fontWeight: '600' }}>Course Details</h4>
                <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{course.details}</p>
              </div>

              {/* PDF Download Section */}
              <div className="mb-4 p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #e0e0e0' }}>
                <h4 className="mb-3" style={{ color: '#005f73', fontSize: '1.5rem', fontWeight: '600' }}>Course Details</h4>
                <a 
                  href={course.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary"
                  style={{ 
                    borderColor: '#005f73', 
                    color: '#005f73',
                    fontSize: '1.1rem',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  <Download className="me-2" size={20} />
                  Download Course Details
                </a>
              </div>

              {/* Important Note */}
              <div className="alert alert-warning d-flex align-items-center mb-4 p-4" style={{ fontSize: '1.1rem' }}>
                <AlertTriangle className="me-3" size={24} />
                <div>
                  <strong>Important Note:</strong> Application form will be rejected if fee is not paid before the last date.
                </div>
              </div>

              {/* Apply Button */}
              <div className="d-grid">
                <button 
                  className="btn btn-lg"
                  style={{ 
                    backgroundColor: '#005f73', 
                    color: '#fff',
                    fontSize: '1.3rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 95, 115, 0.2)'
                  }}
                  onClick={handleApplyClick}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;