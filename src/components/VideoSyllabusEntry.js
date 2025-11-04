import React, { useState, useRef, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';

export default function VideoSyllabusEntry() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeSyllabuses, setActiveSyllabuses] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [allVideoSyllabuses, setAllVideoSyllabuses] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchText, setSearchText] = useState('');
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

  // Fetch all video syllabuses from video-syllabi collection
  const fetchAllVideoSyllabiFromCollection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/video-syllabi`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video syllabi');
      }
      
      const syllabi = await response.json();
      const allSyllabuses = [];
      
      // Structure: { "Maths": { "chap-1": {...data} }, "fun": { "fun-1": {...data} } }
      Object.entries(syllabi).forEach(([categoryKey, videosInCategory]) => {
        // Check if videosInCategory is an object with video entries
        if (videosInCategory && typeof videosInCategory === 'object') {
          Object.entries(videosInCategory).forEach(([videoKey, videoData]) => {
            // Only process if videoData has fileUrl (it's an actual video)
            if (videoData && typeof videoData === 'object' && videoData.fileUrl) {
              allSyllabuses.push({
                syllabusTitle: videoData.title || videoKey,
                syllabusCategory: videoData.category || categoryKey,
                syllabusDescription: videoData.description || '',
                syllabusFileUrl: videoData.fileUrl,
                paymentAmount: videoData.fees || 0,
                duration: videoData.duration || 'N/A',
                thumbnailUrl: videoData.imageUrl || '',
                createdAt: videoData.createdAt || null,
                isFromCollection: true
              });
            }
          });
        }
      });
      
      return allSyllabuses;
    } catch (error) {
      console.error('Error fetching video syllabi from collection:', error);
      return [];
    }
  };

  // Fetch all video syllabuses for super user (only from collection)
  const fetchAllVideoSyllabuses = async () => {
    try {
      // Fetch only from video-syllabi collection
      const collectionSyllabuses = await fetchAllVideoSyllabiFromCollection();
      
      // Sort by title
      collectionSyllabuses.sort((a, b) => 
        (a.syllabusTitle || '').localeCompare(b.syllabusTitle || '')
      );
      
      return collectionSyllabuses;
    } catch (error) {
      console.error('Error fetching all video syllabuses:', error);
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
    setAllVideoSyllabuses([]);
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
        
        // Fetch all video syllabuses (from both collection and purchases)
        const syllabuses = await fetchAllVideoSyllabuses();
        setAllVideoSyllabuses(syllabuses);
        
        if (syllabuses.length === 0) {
          setError('No video syllabuses found in the system');
        }
        
        return;
      }
      
      // Regular user flow
      const response = await fetch(`${API_BASE_URL}/api/videosyllabuspurchasers`);
      
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
      
      const currentDate = new Date();
      const active = [];
      
      if (student.purchases) {
        Object.values(student.purchases).forEach(purchase => {
          const expirationDate = calculateExpirationDate(
            purchase.purchaseDate, 
            purchase.syllabusDuration
          );
          
          if (expirationDate && expirationDate > currentDate) {
            const remainingDays = calculateRemainingDays(expirationDate);
            
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

  useEffect(() => {
    if (selectedSyllabus && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, [selectedSyllabus]);

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
  
  const calculateRemainingDays = (expirationDate) => {
    try {
      const expDate = new Date(expirationDate);
      const currentDate = new Date();
      
      expDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      const timeDiff = expDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      return daysDiff > 0 ? daysDiff : 0;
    } catch (e) {
      return 0;
    }
  };

  // Handle student ID input change - remove spaces
  const handleStudentIdChange = (e) => {
    const value = e.target.value.replace(/\s/g, ''); // Remove all spaces
    setStudentId(value);
    setError('');
  };

  // Get unique categories from syllabuses
  const getCategories = (syllabuses) => {
    const categories = [...new Set(syllabuses.map(syllabus => syllabus.syllabusCategory))];
    return categories.filter(cat => cat).sort();
  };

  // Filter syllabuses based on search criteria
  const getFilteredSyllabuses = () => {
    let syllabusesToFilter = isSuperUser ? allVideoSyllabuses : activeSyllabuses;
    
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
        const descMatch = syllabus.syllabusDescription?.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
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
    ? getCategories(allVideoSyllabuses) 
    : getCategories(activeSyllabuses);

  const clearFilters = () => {
    setSearchCategory('');
    setSearchText('');
  };

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
          <h3 style={{ marginBottom: '15px' }}>{selectedSyllabus.syllabusTitle}</h3>
          <p style={{ color: '#6c757d', marginBottom: '8px' }}>
            <strong>Category:</strong> {selectedSyllabus.syllabusCategory}
          </p>
          {selectedSyllabus.syllabusDescription && (
            <p style={{ color: '#6c757d', marginBottom: '12px' }}>
              <strong>Description:</strong> {selectedSyllabus.syllabusDescription}
            </p>
          )}
          {!isSuperUser && (
            <p style={{ color: '#6c757d', marginBottom: '12px' }}>
              <strong>Expires in:</strong> <span style={{ color: selectedSyllabus.remainingDays <= 3 ? '#dc3545' : '#28a745' }}>
                {selectedSyllabus.remainingDays} {selectedSyllabus.remainingDays === 1 ? 'day' : 'days'}
              </span>
            </p>
          )}
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
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '10px 30px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
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
      <div style={styles.card}>
        <div style={isSuperUser ? styles.superUserHeader : styles.header}>
          <h2 style={{ textAlign: 'center', marginBottom: 0 }}>
            {isSuperUser ? '👑 Super User - All Video Syllabuses' : 'My Video Syllabus Portal'}
          </h2>
        </div>
        <div style={{ padding: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Enter Student ID</label>
            <input 
              type="text" 
              style={{
                ...styles.input,
                width: '100%',
                border: '1px solid #ced4da',
                fontSize: '16px'
              }}
              value={studentId}
              onChange={handleStudentIdChange}
              placeholder="Enter your Student ID"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
          
          <button 
            style={{
              ...styles.button,
              width: '100%',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '16px'
            }}
            onClick={verifyStudent}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span style={{ 
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                  marginRight: '8px'
                }}></span>
                Verifying...
              </span>
            ) : (
              'Verify & Find My Video Syllabuses'
            )}
          </button>

          {studentDetails && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '15px 20px',
              borderRadius: '8px',
              marginTop: '20px',
              border: '1px solid #c3e6cb'
            }}>
              <h5 style={{ marginBottom: isSuperUser ? '5px' : 0 }}>
                {isSuperUser ? '👑 ' : ''}Welcome, {studentDetails.name}
              </h5>
              {isSuperUser && (
                <p style={{ marginBottom: 0, fontSize: '14px', marginTop: '5px' }}>
                  Super User Access - You can view all video syllabuses from the collection
                </p>
              )}
              {studentDetails.email && <p style={{ marginBottom: 0, fontSize: '14px', marginTop: '5px' }}>Email: {studentDetails.email}</p>}
            </div>
          )}

          {/* Search Box - Shows for both regular users and super users */}
          {studentDetails && ((isSuperUser && allVideoSyllabuses.length > 0) || (!isSuperUser && activeSyllabuses.length > 0)) && (
            <div style={styles.searchBox}>
              <h5 style={{ marginBottom: '15px' }}>🔍 Search Video Syllabuses</h5>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Filter by Category</label>
                  <select 
                    style={{
                      ...styles.input,
                      width: '100%',
                      border: '1px solid #ced4da'
                    }}
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Search by Name or Description</label>
                  <input 
                    type="text" 
                    style={{
                      ...styles.input,
                      width: '100%',
                      border: '1px solid #ced4da'
                    }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Type syllabus name or description..."
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button 
                    style={{
                      ...styles.button,
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
              </div>
              {(searchCategory || searchText) && (
                <div style={{ marginTop: '10px' }}>
                  <small style={{ color: '#6c757d' }}>
                    Showing {filteredSyllabuses.length} of {isSuperUser ? allVideoSyllabuses.length : activeSyllabuses.length} syllabuses
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Super User - All Video Syllabuses */}
          {isSuperUser && allVideoSyllabuses.length > 0 && (
            <div style={{ marginTop: '25px' }}>
              <h4>
                {(searchCategory || searchText) ? 'Search Results' : 'All Available Video Syllabuses'} 
                ({filteredSyllabuses.length})
              </h4>
              {filteredSyllabuses.length === 0 ? (
                <div style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ffeeba'
                }}>
                  No syllabuses found matching your search criteria.
                </div>
              ) : (
                Object.entries(groupedSyllabuses).map(([category, syllabuses]) => (
                  <div key={category} style={{ marginBottom: '25px' }}>
                    <div style={styles.categoryHeader}>
                      {category} ({syllabuses.length} videos)
                    </div>
                    {syllabuses.map((syllabus, index) => (
                      <div 
                        key={index} 
                        style={{
                          ...styles.syllabusCard,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h5 style={{ margin: 0 }}>{syllabus.syllabusTitle}</h5>
                          </div>
                          <p style={{ margin: '5px 0' }}>
                            <strong>Category:</strong> {syllabus.syllabusCategory}
                          </p>
                          {syllabus.syllabusDescription && (
                            <p style={{ margin: '5px 0' }}>
                              <strong>Description:</strong> {syllabus.syllabusDescription}
                            </p>
                          )}
                          {syllabus.duration && (
                            <p style={{ margin: '5px 0' }}>
                              <strong>Duration:</strong> {syllabus.duration}
                            </p>
                          )}
                          {syllabus.paymentAmount > 0 && (
                            <p style={{ margin: '5px 0' }}>
                              <strong>Fees:</strong> ₹{syllabus.paymentAmount}
                            </p>
                          )}
                        </div>
                        <button 
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            alignSelf: 'flex-start'
                          }}
                          onClick={() => handleOpenSyllabus(syllabus)}
                        >
                          Watch Video
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
            <div style={{ marginTop: '25px' }}>
              <h4>
                {(searchCategory || searchText) ? 'Search Results' : 'Your Active Video Syllabuses'} 
                ({filteredSyllabuses.length})
              </h4>
              {filteredSyllabuses.length === 0 ? (
                <div style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ffeeba'
                }}>
                  No syllabuses found matching your search criteria.
                </div>
              ) : (
                Object.entries(groupedSyllabuses).map(([category, syllabuses]) => (
                  <div key={category} style={{ marginBottom: '25px' }}>
                    <div style={styles.categoryHeader}>
                      {category} ({syllabuses.length} videos)
                    </div>
                    {syllabuses.map((syllabus, index) => (
                      <div 
                        key={index} 
                        style={{
                          ...styles.syllabusCard,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h5 style={{ margin: 0 }}>{syllabus.syllabusTitle}</h5>
                            <span 
                              style={{
                                ...styles.badge,
                                backgroundColor: syllabus.remainingDays <= 1 ? '#dc3545' : syllabus.remainingDays <= 3 ? '#ffc107' : '#28a745',
                                color: syllabus.remainingDays <= 3 && syllabus.remainingDays > 1 ? '#000' : '#fff'
                              }}
                            >
                              {syllabus.remainingDays} {syllabus.remainingDays === 1 ? 'day' : 'days'} remaining
                            </span>
                          </div>
                          <p style={{ margin: '5px 0' }}>
                            <strong>Category:</strong> {syllabus.syllabusCategory}
                          </p>
                          {syllabus.syllabusDescription && (
                            <p style={{ margin: '5px 0' }}>
                              <strong>Description:</strong> {syllabus.syllabusDescription}
                            </p>
                          )}
                          <p style={{ margin: '5px 0' }}>
                            <strong>Duration:</strong> {syllabus.syllabusDuration}
                          </p>
                          <p style={{ margin: '5px 0' }}>
                            <strong>Purchase Date:</strong> {formatDate(syllabus.purchaseDate)}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Expires On:</strong> {formatDate(syllabus.expirationDate)}
                          </p>
                        </div>
                        <button 
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            alignSelf: 'flex-start'
                          }}
                          onClick={() => handleOpenSyllabus(syllabus)}
                        >
                          Watch Video
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
          
          {studentDetails && !isSuperUser && activeSyllabuses.length === 0 && (
            <div style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '15px 20px',
              borderRadius: '8px',
              marginTop: '20px',
              border: '1px solid #ffeeba'
            }}>
              <p style={{ margin: 0 }}>You don't have any active video syllabuses. All your purchased video syllabuses have expired or you haven't purchased any yet.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}