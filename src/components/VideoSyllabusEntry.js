import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';
export default function VideoSyllabusEntry() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeSyllabuses, setActiveSyllabuses] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const videoRef = useRef(null);
  
  // Design-focused styles
  const styles = {
    container: {
      backgroundColor: '#f4f6f9',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      maxWidth: '700px',
      width: '100%',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: '12px',
      border: 'none'
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    },
    input: {
      borderRadius: '25px',
      padding: '10px 20px'
    },
    button: {
      borderRadius: '25px',
      padding: '10px 20px',
      fontWeight: 'bold'
    },
    syllabusCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '15px',
      transition: 'all 0.2s ease'
    },
    badge: {
      borderRadius: '12px',
      padding: '5px 10px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    videoPlayer: {
      width: '100%',
      maxHeight: '400px',
      borderRadius: '10px',
      marginTop: '15px'
    },
    videoModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    videoContainer: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '24px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }
  };

  // Calculate expiration date from purchase date and duration
  const calculateExpirationDate = (purchaseDate, duration) => {
    const match = duration.match(/(\d+)\s*(day|days|month|months|year|years)/i);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const date = new Date(purchaseDate);
    
    if (unit.startsWith('day')) {
      date.setDate(date.getDate() + value);
    } else if (unit.startsWith('month')) {
      date.setMonth(date.getMonth() + value);
    } else if (unit.startsWith('year')) {
      date.setFullYear(date.getFullYear() + value);
    }

    return date;
  };

  // Fetch student data and process syllabuses
  const verifyStudent = async () => {
    if (!studentId.trim()) {
      setError('Please enter a Student ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call the API to get students data
      const response = await fetch(`${API_BASE_URL}/api/videosyllabuspurchasers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      
      const responseData = await response.json();
      
      if (!responseData.success || !responseData.data) {
        throw new Error('Invalid response format');
      }
      
      const students = responseData.data;
      
      // Find the specific student by ID
      if (!students[studentId]) {
        setError('Student not found');
        setStudentDetails(null);
        setActiveSyllabuses([]);
        return;
      }
      
      const student = students[studentId];
      
      // Process student's purchases to create active syllabuses
      const currentDate = new Date();
      const active = [];
      
      if (student.purchases) {
        Object.values(student.purchases).forEach(purchase => {
          const expirationDate = calculateExpirationDate(
            purchase.purchaseDate, 
            purchase.syllabusDuration
          );
          
          // Only include purchases that have not expired
          if (expirationDate && expirationDate > currentDate) {
            // Calculate remaining days
            const remainingDays = calculateRemainingDays(expirationDate);
            
            // Format purchase data for display  
            active.push({
              syllabusTitle: purchase.syllabusTitle,
              syllabusCategory: purchase.syllabusCategory,
              syllabusDescription: purchase.syllabusDescription,
              purchaseDate: purchase.purchaseDate,
              syllabusDuration: purchase.syllabusDuration,
              expirationDate: expirationDate.toISOString(),
              remainingDays: remainingDays,
              syllabusFileUrl: purchase.syllabusFileUrl,
              paymentAmount: purchase.paymentAmount
            });
          }
        });
      }
      
      // Set student details and active syllabuses
      setStudentDetails({
        name: student.name,
        email: student.email,
        phoneNo: student.phoneNo,
        age: student.age,
        gender: student.gender,
        state: student.state,
        district: student.district
      });
      
      setActiveSyllabuses(active);
      
      if (active.length === 0) {
        setError('No active syllabus purchases found');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(err);
      setStudentDetails(null);
      setActiveSyllabuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSyllabus = (syllabus) => {
    setSelectedSyllabus(syllabus);
  };

  const closeSyllabusViewer = () => {
    setSelectedSyllabus(null);
  };

  // Auto-play video when selected syllabus changes
  useEffect(() => {
    if (selectedSyllabus && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, [selectedSyllabus]);

  // Format date as Month Day, Year
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate remaining days between now and expiration date
  const calculateRemainingDays = (expirationDate) => {
    try {
      const expDate = new Date(expirationDate);
      const currentDate = new Date();
      
      // Reset time part for accurate day calculation
      expDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      // Calculate the difference in milliseconds
      const timeDiff = expDate.getTime() - currentDate.getTime();
      
      // Convert to days
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      return daysDiff > 0 ? daysDiff : 0;
    } catch (e) {
      return 0;
    }
  };

  // If video viewer is open, show it in modal
  if (selectedSyllabus) {
    return (
      <div style={styles.videoModal}>
        <button 
          style={styles.closeButton}
          onClick={closeSyllabusViewer}
          aria-label="Close"
        >
          ×
        </button>
        <div style={styles.videoContainer}>
          <h3 className="mb-3">{selectedSyllabus.syllabusTitle}</h3>
          <p className="text-muted mb-2">
            <strong>Category:</strong> {selectedSyllabus.syllabusCategory}
          </p>
          {selectedSyllabus.syllabusDescription && (
            <p className="text-muted mb-3">
              <strong>Description:</strong> {selectedSyllabus.syllabusDescription}
            </p>
          )}
          <p className="text-muted mb-3">
            <strong>Expires in:</strong> <span className={selectedSyllabus.remainingDays <= 3 ? 'text-danger' : 'text-success'}>
              {selectedSyllabus.remainingDays} {selectedSyllabus.remainingDays === 1 ? 'day' : 'days'}
            </span>
          </p>
          <video 
            ref={videoRef}
            style={styles.videoPlayer}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={selectedSyllabus.syllabusFileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="mt-3 text-center">
            <button 
              className="btn btn-secondary"
              onClick={closeSyllabusViewer}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h2 className="text-center mb-0">My Video Syllabus Portal</h2>
        </div>
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="form-label">Enter Student ID</label>
            <input 
              type="text" 
              className="form-control" 
              style={styles.input}
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setError('');
              }}
              placeholder="Enter your Student ID"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <button 
            className="btn btn-primary w-100" 
            style={styles.button}
            onClick={verifyStudent}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verifying...
              </span>
            ) : (
              'Verify & Find My Video Syllabuses'
            )}
          </button>

          {/* Student Details Display */}
          {studentDetails && (
            <div className="mt-4 alert alert-success">
              <h5 className="mb-0">Welcome, {studentDetails.name}</h5>
              {studentDetails.email && <p className="mb-0 small mt-1">Email: {studentDetails.email}</p>}
            </div>
          )}

          {/* Active Syllabuses Display */}
          {activeSyllabuses.length > 0 && (
            <div className="mt-4">
              <h4>Your Active Video Syllabuses</h4>
              {activeSyllabuses.map((syllabus, index) => (
                <div 
                  key={index} 
                  style={styles.syllabusCard} 
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                >
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0">{syllabus.syllabusTitle}</h5>
                      <span 
                        className={`badge ${syllabus.remainingDays <= 1 ? 'bg-danger' : syllabus.remainingDays <= 3 ? 'bg-warning' : 'bg-success'}`} 
                        style={styles.badge}
                      >
                        {syllabus.remainingDays} {syllabus.remainingDays === 1 ? 'day' : 'days'} remaining
                      </span>
                    </div>
                    <p className="mb-1">
                      <strong>Category:</strong> {syllabus.syllabusCategory}
                    </p>
                    {syllabus.syllabusDescription && (
                      <p className="mb-1">
                        <strong>Description:</strong> {syllabus.syllabusDescription}
                      </p>
                    )}
                    <p className="mb-1">
                      <strong>Duration:</strong> {syllabus.syllabusDuration}
                    </p>
                    <p className="mb-1">
                      <strong>Purchase Date:</strong> {formatDate(syllabus.purchaseDate)}
                    </p>
                    <p className="mb-0">
                      <strong>Expires On:</strong> {formatDate(syllabus.expirationDate)}
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary mt-3 mt-md-0"
                    onClick={() => handleOpenSyllabus(syllabus)}
                  >
                    Watch Video
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {studentDetails && activeSyllabuses.length === 0 && (
            <div className="mt-4 alert alert-warning">
              <p className="mb-0">You don't have any active video syllabuses. All your purchased video syllabuses have expired or you haven't purchased any yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}