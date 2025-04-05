import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConifg';
import SecurePdfViewer from './SecurePdfViewer';

export default function PdfSyllabusEntry() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeSyllabuses, setActiveSyllabuses] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Use the API_BASE_URL from your config
  const apiBaseUrl = API_BASE_URL || 'https://arnprivateexamconduct.in';
  
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

  const verifyStudent = async () => {
    if (!studentId.trim()) {
      setError('Please enter a Student ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Modified API call to use the new endpoint
      const response = await fetch(`${apiBaseUrl}/getPurchase/${studentId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin',
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // If it's JSON, parse the error
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        } else {
          // If it's not JSON (likely HTML error page)
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      // Parse the response data
      const data = await response.json();
      
      if (!data || data.length === 0) {
        setError('Student not found or no purchases available');
        setStudentDetails(null);
        setActiveSyllabuses([]);
        return;
      }
      
      // Set student details from the first purchase (assuming student info is consistent across purchases)
      const studentInfo = {
        name: data[0].name || data[0].studentName || 'Student',
        id: data[0].studentId
      };
      
      setStudentDetails(studentInfo);
      
      // Map the purchases to match the structure expected by the component
      const formattedSyllabuses = data.map(purchase => ({
        syllabusTitle: purchase.syllabusTitle || purchase.title || 'Syllabus',
        syllabusCategory: purchase.syllabusCategory || purchase.category || 'General',
        syllabusFilePath: purchase.syllabusFilePath || purchase.filePath,
        purchaseDate: purchase.purchaseDate || purchase.createdAt,
        expirationDate: purchase.expirationDate,
        remainingDays: purchase.remainingDays
      }));
      
      setActiveSyllabuses(formattedSyllabuses);
      
      if (formattedSyllabuses.length === 0) {
        setError('No active syllabus purchases found');
      }
    } catch (err) {
      // Improved error handling for CORS issues
      if (err.message === "Failed to fetch") {
        setError('Server connection error. This may be due to CORS restrictions. Please try again later or contact support.');
      } else if (err.message.includes('NetworkError')) {
        setError('Network error. This may be due to CORS restrictions. Please ensure you have proper server configuration.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSyllabus = async (syllabus) => {
    setLoading(true);
    setError('');
    
    try {
      // Get signed URL for the syllabus PDF
      const response = await fetch(`${apiBaseUrl}/get-syllabus-url/${encodeURIComponent(syllabus.syllabusFilePath)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get PDF URL: ${response.status}`);
      }
      
      const data = await response.json();
      setPdfUrl(data.signedUrl);
      setSelectedSyllabus(syllabus);
      setViewerOpen(true);
    } catch (err) {
      setError(`Could not retrieve syllabus: ${err.message}`);
      console.error('Error getting syllabus URL:', err);
    } finally {
      setLoading(false);
    }
  };

  const closePdfViewer = () => {
    setViewerOpen(false);
    setSelectedSyllabus(null);
    setPdfUrl(null);
  };

  // Simple date formatter without using date-fns
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
  
  // Calculate remaining days without date-fns
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
  if (viewerOpen && selectedSyllabus && pdfUrl) {
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
          pdfUrl={pdfUrl}
          syllabusFilePath={selectedSyllabus.syllabusFilePath}
          studentName={studentDetails?.name}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h2 className="text-center mb-0">My Syllabus Verification</h2>
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
              'Verify & Find Syllabus'
            )}
          </button>

          {/* Student Details Display */}
          {studentDetails && (
            <div className="mt-4 alert alert-success">
              <h5 className="mb-0">Welcome, {studentDetails.name}</h5>
            </div>
          )}

          {/* Active Syllabuses Display */}
          {activeSyllabuses.length > 0 && (
            <div className="mt-4">
              <h4>Your Active Syllabuses</h4>
              {activeSyllabuses.map((syllabus, index) => {
                // Calculate remaining days if not already provided
                const remainingDays = syllabus.remainingDays !== undefined ? 
                  syllabus.remainingDays : 
                  calculateRemainingDays(syllabus.expirationDate);
                  
                return (
                  <div 
                    key={index} 
                    style={styles.syllabusCard} 
                    className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">{syllabus.syllabusTitle}</h5>
                        <span 
                          className="badge bg-success" 
                          style={styles.badge}
                        >
                          {remainingDays} {remainingDays === 1 ? 'day' : 'days'} remaining
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}