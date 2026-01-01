import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfigCourse';

const AdminCoursePayments = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [feeAmount, setFeeAmount] = useState('');

  useEffect(() => {
    fetchSelectedCandidates();
  }, []);

  const fetchSelectedCandidates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      const data = await response.json();
      if (data.success) {
        const applicationsArray = Object.entries(data.data)
          .map(([key, value]) => ({
            ...value,
            key,
            feeAmount: value.feeAmount || ''
          }))
          .filter(app => app.status === 'SELECTED');
        
        // Fetch fee amounts for each candidate
        const candidatesWithFees = await Promise.all(
          applicationsArray.map(async (candidate) => {
            try {
              const feeResponse = await fetch(
                `${API_BASE_URL}/payments/${candidate.courseName}/${candidate.applicationId}`
              );
              const feeData = await feeResponse.json();
              return {
                ...candidate,
                feeAmount: feeData.success ? feeData.data.feeAmount : ''
              };
            } catch (error) {
              console.error(`Error fetching fee for ${candidate.applicationId}:`, error);
              return candidate;
            }
          })
        );

        const sortedApplications = candidatesWithFees.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });
        
        setSelectedCandidates(sortedApplications);
        const uniqueCourses = [...new Set(applicationsArray.map(app => app.courseName))];
        setCourses(uniqueCourses);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch selected candidates');
      setLoading(false);
    }
  };

  const savePaymentData = async (candidate) => {
    try {
      const paymentResponse = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: candidate.applicationId,
          courseName: candidate.courseName,
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          feeAmount: parseFloat(feeAmount)
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to save payment data');
      }

      await handleFeeUpdate(candidate.applicationId, candidate.courseName);
      await fetchSelectedCandidates(); // Refresh the data after saving
    } catch (err) {
      setError('Failed to save payment data: ' + err.message);
      setEditingId(null);
    }
  };

  const handleFeeUpdate = async (applicationId, courseName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/${courseName}/${applicationId}`, 
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feeAmount: parseFloat(feeAmount) })
        }
      );
      
      if (response.ok) {
        setSelectedCandidates(prev => 
          prev.map(candidate => 
            candidate.applicationId === applicationId 
              ? { ...candidate, feeAmount }
              : candidate
          )
        );
        setEditingId(null);
        setFeeAmount('');
      } else {
        throw new Error('Failed to update fee amount');
      }
    } catch (err) {
      setError('Failed to update fee amount: ' + err.message);
    }
  };

  const filteredCandidates = selectedCourse === 'all' 
    ? selectedCandidates.filter(candidate => 
        searchTerm === '' || 
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : selectedCandidates.filter(candidate => 
        candidate.courseName === selectedCourse &&
        (searchTerm === '' || 
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const calculateSubtotal = () => {
    const total = filteredCandidates.reduce((sum, candidate) => {
      const fee = parseFloat(candidate.feeAmount) || 0;
      return sum + fee;
    }, 0);
    
    if (total === 0 && filteredCandidates.some(candidate => !candidate.feeAmount)) {
      return 'N/A';
    }
    return `₹${total.toLocaleString()}`;
  };

  const styles = {
    // ... (previous styles remain the same)
    subtotalContainer: {
      backgroundColor: '#FDF2F8',
      padding: '15px 20px',
      borderTop: '2px solid #F9A8D4',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '20px'
    },
    subtotalLabel: {
      color: '#831843',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    subtotalAmount: {
      color: '#EC4899',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    header: {
      backgroundColor: '#FDF2F8',
      padding: '20px',
      borderRadius: '8px 8px 0 0',
      marginBottom: '20px',
      borderBottom: '2px solid #F9A8D4'
    },
    headerTitle: {
      color: '#831843',
      fontSize: '24px',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    badge: {
      backgroundColor: '#FBCFE8',
      color: '#831843',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '14px'
    },
    filterContainer: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#FCE7F3',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #F9A8D4',
      backgroundColor: 'white',
      color: '#831843',
      minWidth: '200px'
    },
    searchInput: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #F9A8D4',
      backgroundColor: 'white',
      color: '#831843',
      minWidth: '250px'
    },
    feeInput: {
      padding: '6px 10px',
      borderRadius: '4px',
      border: '1px solid #F9A8D4',
      width: '100px'
    },
    saveButton: {
      backgroundColor: '#EC4899',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 12px',
      cursor: 'pointer'
    },
    editButton: {
      backgroundColor: '#FDF2F8',
      color: '#EC4899',
      border: '1px solid #F9A8D4',
      borderRadius: '4px',
      padding: '6px 12px',
      cursor: 'pointer'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'auto',
      border: '1px solid #F9A8D4'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '0'
    },
    th: {
      backgroundColor: '#FCE7F3',
      color: '#831843',
      padding: '15px',
      textAlign: 'left',
      borderBottom: '2px solid #F9A8D4',
      fontWeight: 'bold'
    },
    td: {
      padding: '12px 15px',
      borderBottom: '1px solid #F9A8D4',
      borderRight: '1px solid #F9A8D4'
    },
    loadingText: {
      textAlign: 'center',
      color: '#831843',
      padding: '40px',
      fontSize: '18px'
    },
    errorText: {
      textAlign: 'center',
      color: '#DC2626',
      padding: '20px'
    },
    noDataText: {
      textAlign: 'center',
      color: '#831843',
      padding: '40px',
      fontSize: '16px'
    }
  };

  if (loading) return (
    <div style={styles.loadingText}>
      Loading selected candidates...
    </div>
  );

  if (error) return (
    <div style={styles.errorText}>
      {error}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          Payment Management 
          <span style={styles.badge}>
            {filteredCandidates.length} Selected
          </span>
        </h2>
        <div style={styles.filterContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="courseFilter" style={{color: '#831843', fontWeight: 'bold'}}>
              Filter by Course:
            </label>
            <select
              id="courseFilter"
              style={styles.select}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="searchFilter" style={{color: '#831843', fontWeight: 'bold'}}>
              Search by Name/ID:
            </label>
            <input
              id="searchFilter"
              type="text"
              placeholder="Search by name or application ID..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div style={styles.tableContainer}>
        {filteredCandidates.length > 0 ? (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr. No</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Application ID</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Fee Amount</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <tr key={candidate.applicationId}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{candidate.name}</td>
                    <td style={styles.td}>{candidate.phone}</td>
                    <td style={styles.td}>{candidate.city}</td>
                    <td style={styles.td}>{candidate.state}</td>
                    <td style={styles.td}>{candidate.applicationId}</td>
                    <td style={styles.td}>{candidate.courseName}</td>
                    <td style={styles.td}>
                      {editingId === candidate.applicationId ? (
                        <input
                          type="number"
                          style={styles.feeInput}
                          value={feeAmount}
                          onChange={(e) => setFeeAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                      ) : (
                        <span>{candidate.feeAmount ? `₹${candidate.feeAmount}` : '-'}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === candidate.applicationId ? (
                        <button
                          style={styles.saveButton}
                          onClick={() => savePaymentData(candidate)}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          style={styles.editButton}
                          onClick={() => {
                            setEditingId(candidate.applicationId);
                            setFeeAmount(candidate.feeAmount || '');
                          }}
                        >
                          Edit Fee
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.subtotalContainer}>
              <span style={styles.subtotalLabel}>
                Subtotal ({selectedCourse === 'all' ? 'All Courses' : selectedCourse}):
              </span>
              <span style={styles.subtotalAmount}>
                {calculateSubtotal()}
              </span>
            </div>
          </>
        ) : (
          <div style={styles.noDataText}>
            No selected candidates found for the current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoursePayments;