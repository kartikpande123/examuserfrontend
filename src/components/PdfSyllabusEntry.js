import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SecurePdfViewer from './SecurePdfViewer';
import API_BASE_URL from './ApiConifg';

export default function PdfSyllabusEntry() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeSyllabuses, setActiveSyllabuses] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
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
  }
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
      const response = await fetch(`${API_BASE_URL}/api/pdfsyllabuspurchasers`);
      
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
          const expirationDate = new Date(purchase.expirationDate);
          
          // Only include purchases that have not expired
          if (expirationDate > currentDate) {
            // Calculate remaining days
            const remainingDays = calculateRemainingDays(purchase.expirationDate);
            
            // Format purchase data for display  
            active.push({
              syllabusTitle: purchase.syllabusTitle,
              syllabusCategory: purchase.syllabusCategory,
              purchaseDate: purchase.purchaseDate,
              expirationDate: purchase.expirationDate,
              remainingDays: remainingDays
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
    setViewerOpen(true);
  };

  const closePdfViewer = () => {
    setViewerOpen(false);
    setSelectedSyllabus(null);
  };

  // Format date as Month Day, Year
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
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
  const calculateRemainingDays = (expirationDateString) => {
    try {
      const expirationDate = new Date(expirationDateString);
      const currentDate = new Date();
      
      // Reset time part for accurate day calculation
      expirationDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      // Calculate the difference in milliseconds
      const timeDiff = expirationDate.getTime() - currentDate.getTime();
      
      // Convert to days
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      return daysDiff > 0 ? daysDiff : 0;
    } catch (e) {
      return 0;
    }
  };

  // If PDF viewer is open, show it instead of the main content
  if (viewerOpen && selectedSyllabus) {
    return (
      <div className="position-relative">
        <button 
          className="btn btn-primary position-absolute" 
          style={{ top: 20, left: 20, zIndex: 1000 }}
          onClick={closePdfViewer}
        >
          Back to Syllabuses
        </button>
        <SecurePdfViewer 
          selectedSyllabus={selectedSyllabus}
          studentName={studentDetails?.name}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h2 className="text-center mb-0">My Syllabus Portal</h2>
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
              'Verify & Find My Syllabuses'
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
              <h4>Your Active Syllabuses</h4>
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
                    View Securely
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {studentDetails && activeSyllabuses.length === 0 && (
            <div className="mt-4 alert alert-warning">
              <p className="mb-0">You don't have any active syllabuses. All your purchased syllabuses have expired or you haven't purchased any yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}