import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SecurePdfViewer from './SecurePdfViewer';
import API_BASE_URL from './ApiConfig';

export default function PdfSyllabusEntry() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeSyllabuses, setActiveSyllabuses] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [allPdfSyllabuses, setAllPdfSyllabuses] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  
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
      maxWidth: '900px',
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
    superUserHeader: {
      backgroundColor: '#e74c3c',
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
    categoryHeader: {
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    searchBox: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px',
      border: '1px solid #dee2e6'
    }
  };

  // Check if user is a super user
  const checkSuperUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-user-all`);
      
      if (!response.ok) {
        return false;
      }
      
      const responseData = await response.json();
      
      if (!responseData.success || !responseData.purchasers) {
        return false;
      }
      
      const superUser = responseData.purchasers.find(user => user.userId === userId);
      
      if (!superUser) {
        return false;
      }
      
      // Check if any purchase is not expired
      const currentDate = new Date();
      const hasActivePurchase = Object.values(superUser.purchases || {}).some(purchase => {
        const expiryDate = new Date(purchase.expiryDate);
        return expiryDate > currentDate && purchase.isActive;
      });
      
      return hasActivePurchase;
    } catch (error) {
      console.error('Error checking super user:', error);
      return false;
    }
  };

  // Fetch all PDF syllabuses from pdf-syllabi collection
  const fetchAllPdfSyllabiFromCollection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF syllabi');
      }
      
      const syllabi = await response.json();
      const allSyllabuses = [];
      
      // Structure: { "Category": { "Title": {...data} } }
      Object.entries(syllabi).forEach(([categoryKey, pdfsInCategory]) => {
        // Check if pdfsInCategory is an object with PDF entries
        if (pdfsInCategory && typeof pdfsInCategory === 'object') {
          Object.entries(pdfsInCategory).forEach(([pdfKey, pdfData]) => {
            // Only process if pdfData has fileUrl (it's an actual PDF)
            if (pdfData && typeof pdfData === 'object' && pdfData.fileUrl) {
              allSyllabuses.push({
                syllabusTitle: pdfData.title || pdfKey,
                syllabusCategory: pdfData.category || categoryKey,
                syllabusDescription: pdfData.description || '',
                syllabusFileUrl: pdfData.fileUrl,
                paymentAmount: pdfData.fees || 0,
                duration: pdfData.duration || 'N/A',
                thumbnailUrl: pdfData.imageUrl || '',
                createdAt: pdfData.createdAt || null,
                isFromCollection: true
              });
            }
          });
        }
      });
      
      return allSyllabuses;
    } catch (error) {
      console.error('Error fetching PDF syllabi from collection:', error);
      return [];
    }
  };

  // Fetch all PDF syllabuses for super user (only from collection)
  const fetchAllPdfSyllabuses = async () => {
    try {
      // Fetch only from pdf-syllabi collection
      const collectionSyllabuses = await fetchAllPdfSyllabiFromCollection();
      
      // Sort by title
      collectionSyllabuses.sort((a, b) => 
        (a.syllabusTitle || '').localeCompare(b.syllabusTitle || '')
      );
      
      return collectionSyllabuses;
    } catch (error) {
      console.error('Error fetching all PDF syllabuses:', error);
      return [];
    }
  };

  // Fetch student data and process syllabuses
  const verifyStudent = async () => {
    const trimmedId = studentId.trim();
    
    if (!trimmedId) {
      setError('Please enter a Student ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setIsSuperUser(false);
    setAllPdfSyllabuses([]);
    setSearchCategory('');
    setSearchText('');
    
    try {
      // First check if user is a super user
      const isSuperUserCheck = await checkSuperUser(trimmedId);
      
      if (isSuperUserCheck) {
        setIsSuperUser(true);
        
        // Fetch super user details
        const superUserResponse = await fetch(`${API_BASE_URL}/api/super-user-all`);
        const superUserData = await superUserResponse.json();
        const superUser = superUserData.purchasers.find(user => user.userId === trimmedId);
        
        if (superUser && superUser.userDetails) {
          setStudentDetails({
            name: superUser.userDetails.name,
            email: superUser.userDetails.email,
            phoneNo: superUser.userDetails.phoneNo,
            age: superUser.userDetails.age,
            gender: superUser.userDetails.gender,
            state: superUser.userDetails.state,
            district: superUser.userDetails.district
          });
        }
        
        // Fetch all PDF syllabuses from collection
        const syllabuses = await fetchAllPdfSyllabuses();
        setAllPdfSyllabuses(syllabuses);
        
        if (syllabuses.length === 0) {
          setError('No PDF syllabuses found in the system');
        }
        
        return;
      }
      
      // Regular user flow
      const response = await fetch(`${API_BASE_URL}/api/pdfsyllabuspurchasers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      
      const responseData = await response.json();
      
      if (!responseData.success || !responseData.data) {
        throw new Error('Invalid response format');
      }
      
      const students = responseData.data;
      
      if (!students[trimmedId]) {
        setError('Student not found');
        setStudentDetails(null);
        setActiveSyllabuses([]);
        return;
      }
      
      const student = students[trimmedId];
      
      // Process student's purchases to create active syllabuses
      const currentDate = new Date();
      const active = [];
      
      if (student.purchases) {
        Object.values(student.purchases).forEach(purchase => {
          const expirationDate = new Date(purchase.expirationDate);
          
          if (expirationDate > currentDate) {
            const remainingDays = calculateRemainingDays(purchase.expirationDate);
            
            active.push({
              syllabusTitle: purchase.syllabusTitle,
              syllabusCategory: purchase.syllabusCategory,
              purchaseDate: purchase.purchaseDate,
              expirationDate: purchase.expirationDate,
              remainingDays: remainingDays,
              syllabusFileUrl: purchase.syllabusFileUrl
            });
          }
        });
      }
      
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
  const calculateRemainingDays = (expirationDateString) => {
    try {
      const expirationDate = new Date(expirationDateString);
      const currentDate = new Date();
      
      expirationDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      const timeDiff = expirationDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      return daysDiff > 0 ? daysDiff : 0;
    } catch (e) {
      return 0;
    }
  };

  // Handle student ID input change - remove spaces
  const handleStudentIdChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setStudentId(value);
    setError('');
  };

  // Get unique categories
  const getCategories = (syllabuses) => {
    const categories = [...new Set(syllabuses.map(syllabus => syllabus.syllabusCategory))];
    return categories.filter(cat => cat).sort();
  };

  // Filter syllabuses based on search criteria
  const getFilteredSyllabuses = () => {
    let syllabusesToFilter = isSuperUser ? allPdfSyllabuses : activeSyllabuses;
    
    if (!syllabusesToFilter || syllabusesToFilter.length === 0) {
      return [];
    }

    return syllabusesToFilter.filter(syllabus => {
      // Category filter
      if (searchCategory && syllabus.syllabusCategory !== searchCategory) {
        return false;
      }
      
      // Text search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const titleMatch = syllabus.syllabusTitle?.toLowerCase().includes(searchLower);
        return titleMatch;
      }
      
      return true;
    });
  };

  // Group syllabuses by category for display
  const groupSyllabusesByCategory = (syllabuses) => {
    return syllabuses.reduce((acc, syllabus) => {
      const category = syllabus.syllabusCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(syllabus);
      return acc;
    }, {});
  };

  const filteredSyllabuses = getFilteredSyllabuses();
  const groupedSyllabuses = groupSyllabusesByCategory(filteredSyllabuses);
  const availableCategories = isSuperUser 
    ? getCategories(allPdfSyllabuses) 
    : getCategories(activeSyllabuses);

  const clearFilters = () => {
    setSearchCategory('');
    setSearchText('');
  };

  // If PDF viewer is open, show it instead of the main content
  if (viewerOpen && selectedSyllabus) {
    return (
      <div className="position-relative">
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
        <div style={isSuperUser ? styles.superUserHeader : styles.header}>
          <h2 className="text-center mb-0">
            {isSuperUser ? '👑 Super User - All PDF Syllabuses' : 'My Syllabus Portal'}
          </h2>
        </div>
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="form-label">Enter Student ID</label>
            <input 
              type="text" 
              className="form-control" 
              style={styles.input}
              value={studentId}
              onChange={handleStudentIdChange}
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
              'Verify & Find My PDF Syllabuses'
            )}
          </button>

          {/* Student Details Display */}
          {studentDetails && (
            <div className="mt-4 alert alert-success">
              <h5 className={isSuperUser ? 'mb-1' : 'mb-0'}>
                {isSuperUser ? '👑 ' : ''}Welcome, {studentDetails.name}
              </h5>
              {isSuperUser && (
                <p className="mb-0 small mt-1">
                  Super User Access - You can view all PDF syllabuses from the collection
                </p>
              )}
              {studentDetails.email && <p className="mb-0 small mt-1">Email: {studentDetails.email}</p>}
            </div>
          )}

          {/* Search Box - Shows for both regular users and super users */}
          {studentDetails && ((isSuperUser && allPdfSyllabuses.length > 0) || (!isSuperUser && activeSyllabuses.length > 0)) && (
            <div style={styles.searchBox}>
              <h5 className="mb-3">🔍 Search PDF Syllabuses</h5>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label small">Filter by Category</label>
                  <select 
                    className="form-select" 
                    style={styles.input}
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label small">Search by Syllabus Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={styles.input}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Type syllabus name..."
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button 
                    className="btn btn-secondary w-100" 
                    style={styles.button}
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
              </div>
              {(searchCategory || searchText) && (
                <div className="mt-2">
                  <small className="text-muted">
                    Showing {filteredSyllabuses.length} of {isSuperUser ? allPdfSyllabuses.length : activeSyllabuses.length} syllabuses
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Super User - All PDF Syllabuses */}
          {isSuperUser && allPdfSyllabuses.length > 0 && (
            <div className="mt-4">
              <h4>
                {(searchCategory || searchText) ? 'Search Results' : 'All Available PDF Syllabuses'} 
                ({filteredSyllabuses.length})
              </h4>
              {filteredSyllabuses.length === 0 ? (
                <div className="alert alert-warning">
                  No syllabuses found matching your search criteria.
                </div>
              ) : (
                Object.entries(groupedSyllabuses).map(([category, syllabuses]) => (
                  <div key={category} className="mb-4">
                    <div style={styles.categoryHeader}>
                      {category} ({syllabuses.length} syllabuses)
                    </div>
                    {syllabuses.map((syllabus, index) => (
                      <div 
                        key={index} 
                        style={styles.syllabusCard}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="mb-0">{syllabus.syllabusTitle}</h5>
                          </div>
                          <p className="mb-1">
                            <strong>Category:</strong> {syllabus.syllabusCategory}
                          </p>
                          {syllabus.syllabusDescription && (
                            <p className="mb-1">
                              <strong>Description:</strong> {syllabus.syllabusDescription}
                            </p>
                          )}
                          {syllabus.duration && (
                            <p className="mb-1">
                              <strong>Duration:</strong> {syllabus.duration}
                            </p>
                          )}
                          {syllabus.paymentAmount > 0 && (
                            <p className="mb-1">
                              <strong>Fees:</strong> ₹{syllabus.paymentAmount}
                            </p>
                          )}
                        </div>
                        <button 
                          className="btn btn-primary mt-2"
                          style={styles.button}
                          onClick={() => handleOpenSyllabus(syllabus)}
                        >
                          View PDF
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Regular User - Active Syllabuses */}
          {!isSuperUser && activeSyllabuses.length > 0 && (
            <div className="mt-4">
              <h4>
                {(searchCategory || searchText) ? 'Search Results' : 'Your Active Syllabuses'} 
                ({filteredSyllabuses.length})
              </h4>
              {filteredSyllabuses.length === 0 ? (
                <div className="alert alert-warning">
                  No syllabuses found matching your search criteria.
                </div>
              ) : (
                Object.entries(groupedSyllabuses).map(([category, syllabuses]) => (
                  <div key={category} className="mb-4">
                    <div style={styles.categoryHeader}>
                      {category} ({syllabuses.length} syllabuses)
                    </div>
                    {syllabuses.map((syllabus, index) => (
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
                ))
              )}
            </div>
          )}
          
          {studentDetails && !isSuperUser && activeSyllabuses.length === 0 && (
            <div className="mt-4 alert alert-warning">
              <p className="mb-0">You don't have any active syllabuses. All your purchased syllabuses have expired or you haven't purchased any yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}