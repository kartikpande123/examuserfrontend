import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';

const PracticeExamEntry = () => {
  const [studentId, setStudentId] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState('');
  const [activeExams, setActiveExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [allPracticeTests, setAllPracticeTests] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

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
    examCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '15px',
      transition: 'all 0.2s ease'
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
      
      // The API returns: { success: true, count: X, purchasers: [...] }
      if (!responseData.success || !responseData.purchasers || !Array.isArray(responseData.purchasers)) {
        return false;
      }
      
      // Find the user in the purchasers array
      const superUser = responseData.purchasers.find(user => user.userId === userId);
      
      if (!superUser) {
        return false;
      }
      
      // Check if user has active subscription
      if (superUser.hasActiveSubscription) {
        // Verify the subscription hasn't expired
        const currentDate = new Date();
        const latestExpiry = new Date(superUser.latestExpiry);
        return latestExpiry > currentDate;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking super user:', error);
      return false;
    }
  };

  // Fetch all practice tests for super user
  const fetchAllPracticeTests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-user-practice-tests`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch practice tests');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.practiceTests) {
        return [];
      }
      
      // Sort by category and title
      const sortedTests = data.practiceTests.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.title.localeCompare(b.title);
      });
      
      return sortedTests;
    } catch (error) {
      console.error('Error fetching all practice tests:', error);
      return [];
    }
  };

  const verifyStudent = async () => {
    const trimmedId = studentId.trim();
    
    if (!trimmedId) {
      setError('Please enter a Student ID');
      return;
    }

    setLoading(true);
    setError('');
    setIsSuperUser(false);
    setAllPracticeTests([]);
    setActiveExams([]);
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
        
        // Access the super user data directly using userId as key
        const superUser = superUserData[trimmedId];
        
        if (superUser && superUser.userDetails) {
          setStudentDetails({
            name: superUser.userDetails.name || 'Super User',
            email: superUser.userDetails.email || '',
            phoneNo: superUser.userDetails.phoneNo || ''
          });
        } else {
          // Fallback if userDetails not available
          setStudentDetails({
            name: 'Super User',
            email: '',
            phoneNo: ''
          });
        }
        
        // Fetch all practice tests
        const tests = await fetchAllPracticeTests();
        setAllPracticeTests(tests);
        
        if (tests.length === 0) {
          setError('No practice tests found in the system');
        }
        
        return;
      }

      // Regular user flow - verify student
      const studentResponse = await fetch(`${API_BASE_URL}/api/verify-student/${trimmedId}`);
      const studentData = await studentResponse.json();

      if (!studentData.exists) {
        setError('Student not found');
        return;
      }

      setStudentDetails(studentData.studentDetails);

      // Check exam purchases
      const currentDate = new Date();
      const activeExamList = studentData.studentDetails.purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        const examDuration = purchase.examDetails.duration.includes('days') 
          ? parseInt(purchase.examDetails.duration) 
          : 1;
        const expirationDate = new Date(purchaseDate);
        expirationDate.setDate(expirationDate.getDate() + examDuration);

        return currentDate <= expirationDate;
      });

      if (activeExamList.length === 0) {
        setError('No active exam purchase found');
        return;
      }

      setActiveExams(activeExamList);

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (exam, isSuperUserExam = false) => {
    if (isSuperUserExam) {
      // For super user accessing from all tests list
      const examSessionData = {
        studentId: studentId,
        examDetails: {
          title: exam.title,
          category: exam.category,
          duration: exam.duration || 'N/A',
          timeLimit: exam.timeLimit || 'N/A',
          createdAt: exam.createdAt || Date.now()
        },
        isSuperUser: true
      };

      localStorage.setItem('practiceExamSession', JSON.stringify(examSessionData));
      
      navigate('/practiceexam', { 
        state: { 
          studentId, 
          examDetails: {
            title: exam.title,
            category: exam.category,
            duration: exam.duration || 'N/A',
            timeLimit: exam.timeLimit || 'N/A',
            createdAt: exam.createdAt || Date.now()
          },
          isSuperUser: true
        } 
      });
    } else {
      // Regular user flow
      const examSessionData = {
        studentId: studentId,
        examDetails: {
          title: exam.examDetails.title,
          category: exam.examDetails.category,
          duration: exam.examDetails.duration,
          timeLimit: exam.examDetails.timeLimit,
          createdAt: exam.examDetails.createdAt
        },
        purchaseDate: exam.purchaseDate
      };

      localStorage.setItem('practiceExamSession', JSON.stringify(examSessionData));
      
      navigate('/practiceexam', { 
        state: { 
          studentId, 
          examDetails: exam.examDetails 
        } 
      });
    }
  };

  const handleStudentIdChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setStudentId(value);
    setError('');
  };

  // Get unique categories from tests
  const getCategories = (tests) => {
    const categories = [...new Set(tests.map(test => test.category || test.examDetails?.category))];
    return categories.filter(cat => cat).sort();
  };

  // Filter tests based on search criteria
  const getFilteredTests = () => {
    let testsToFilter = isSuperUser ? allPracticeTests : activeExams;
    
    if (!testsToFilter || testsToFilter.length === 0) {
      return [];
    }

    return testsToFilter.filter(test => {
      const testCategory = isSuperUser ? test.category : test.examDetails?.category;
      const testTitle = isSuperUser ? test.title : test.examDetails?.title;
      
      // Category filter
      if (searchCategory && testCategory !== searchCategory) {
        return false;
      }
      
      // Text search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const titleMatch = testTitle?.toLowerCase().includes(searchLower);
        return titleMatch;
      }
      
      return true;
    });
  };

  // Group tests by category for display
  const groupTestsByCategory = (tests) => {
    return tests.reduce((acc, test) => {
      const category = isSuperUser ? test.category : test.examDetails?.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(test);
      return acc;
    }, {});
  };

  const filteredTests = getFilteredTests();
  const groupedTests = groupTestsByCategory(filteredTests);
  const availableCategories = isSuperUser 
    ? getCategories(allPracticeTests) 
    : getCategories(activeExams);

  const clearFilters = () => {
    setSearchCategory('');
    setSearchText('');
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={isSuperUser ? styles.superUserHeader : styles.header}>
          <h2 className="text-center mb-0">
            {isSuperUser ? '👑 Super User - All Practice Tests' : 'Practice Exam Verification'}
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
              'Verify & Find Exam'
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
                  Super User Access - You can access all practice tests in the system
                </p>
              )}
              {studentDetails.email && (
                <p className="mb-0 small mt-1">Email: {studentDetails.email}</p>
              )}
            </div>
          )}

          {/* Search Box - Shows for both regular users and super users */}
          {studentDetails && ((isSuperUser && allPracticeTests.length > 0) || (!isSuperUser && activeExams.length > 0)) && (
            <div style={styles.searchBox}>
              <h5 className="mb-3">🔍 Search Practice Tests</h5>
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
                  <label className="form-label small">Search by Test Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={styles.input}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Type test name..."
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
                    Showing {filteredTests.length} of {isSuperUser ? allPracticeTests.length : activeExams.length} tests
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Super User - All Practice Tests */}
          {isSuperUser && allPracticeTests.length > 0 && (
            <div className="mt-4">
              <h4>
                {(searchCategory || searchText) ? 'Search Results' : 'All Available Practice Tests'} 
                ({filteredTests.length})
              </h4>
              {filteredTests.length === 0 ? (
                <div className="alert alert-warning">
                  No tests found matching your search criteria.
                </div>
              ) : (
                Object.entries(groupedTests).map(([category, tests]) => (
                  <div key={category} className="mb-4">
                    <div style={styles.categoryHeader}>
                      {category} ({tests.length} tests)
                    </div>
                    {tests.map((test, index) => (
                      <div key={index} style={styles.examCard}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <h6 className="mb-2">{test.title}</h6>
                            <p className="mb-1 small">
                              <strong>Duration:</strong> {test.duration || 'N/A'}
                            </p>
                            <p className="mb-0 small">
                              <strong>Time Limit:</strong> {test.timeLimit || 'N/A'}
                            </p>
                            {test.fees > 0 && (
                              <p className="mb-0 small">
                                <strong>Fees:</strong> ₹{test.fees}
                              </p>
                            )}
                          </div>
                          <button 
                            className="btn btn-primary"
                            style={{ borderRadius: '25px', padding: '8px 16px' }}
                            onClick={() => handleStartExam(test, true)}
                          >
                            Start Exam
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Regular User - Active Exams */}
          {!isSuperUser && activeExams.length > 0 && (
            <div className="mt-4">
              <h4>
                {(searchCategory || searchText) ? 'Search Results' : 'Your Active Exams'} 
                ({filteredTests.length})
              </h4>
              {filteredTests.length === 0 ? (
                <div className="alert alert-warning">
                  No exams found matching your search criteria.
                </div>
              ) : (
                Object.entries(groupedTests).map(([category, tests]) => (
                  <div key={category} className="mb-4">
                    <div style={styles.categoryHeader}>
                      {category} ({tests.length} exams)
                    </div>
                    {tests.map((purchase, index) => (
                      <div 
                        key={index} 
                        style={styles.examCard} 
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h5>{purchase.examDetails.title}</h5>
                          <p className="mb-1">
                            <strong>Category:</strong> {purchase.examDetails.category}
                          </p>
                          <p className="mb-1">
                            <strong>Duration:</strong> {purchase.examDetails.duration}
                          </p>
                          <p className="mb-0">
                            <strong>Time Limit:</strong> {purchase.examDetails.timeLimit}
                          </p>
                        </div>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleStartExam(purchase)}
                        >
                          Start Exam
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {studentDetails && !isSuperUser && activeExams.length === 0 && (
            <div className="mt-4 alert alert-warning">
              <p className="mb-0">
                You don't have any active practice exams. All your purchased exams have expired or you haven't purchased any yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeExamEntry;