import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfigCourse';

const AdminCourseApllications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      const data = await response.json();
      if (data.success) {
        const applicationsArray = Object.entries(data.data).map(([key, value]) => ({
          ...value,
          key
        }));
        
        // Sort applications by createdAt/submittedAt in descending order (newest first)
        const sortedApplications = applicationsArray.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.submittedAt || 0);
          const dateB = new Date(b.createdAt || b.submittedAt || 0);
          return dateB - dateA;
        });
        
        setApplications(sortedApplications);
        
        // Extract unique courses for dropdown
        const uniqueCourses = [...new Set(applicationsArray.map(app => app.courseName))];
        setCourses(uniqueCourses);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications');
      setLoading(false);
    }
  };

  const handleStatus = async (applicationId, newStatus) => {
    try {
      console.log('Updating status for application:', applicationId, 'to:', newStatus);
      
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      const data = await response.json();
      console.log('Response data:', data);  // Debug log
      
      if (data.success) {
        // Update local state while maintaining sort order
        setApplications(prevApplications => {
          const updatedApplications = prevApplications.map(app => {
            if (app.applicationId === applicationId) {
              return { 
                ...app, 
                status: newStatus,
              };
            }
            return app;
          });
          // Re-sort to maintain order
          return updatedApplications.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.submittedAt || 0);
            const dateB = new Date(b.createdAt || b.submittedAt || 0);
            return dateB - dateA;
          });
        });
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(`Failed to update application status: ${err.message}`);
    }
  };

  const filteredApplications = selectedCourse === 'all' 
    ? applications.filter(app => 
        searchTerm === '' || 
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : applications.filter(app => 
        app.courseName === selectedCourse && 
        (searchTerm === '' || 
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const styles = {
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
      marginBottom: '15px'
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
    selectButton: {
      backgroundColor: '#22C55E',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      marginRight: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    rejectButton: {
      backgroundColor: '#EF4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginRight: '8px'
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
    }
  };

  const getStatusBadgeStyle = (status) => ({
    ...styles.statusBadge,
    backgroundColor: 
      status === 'SELECTED' ? '#DCFCE7' :
      status === 'REJECTED' ? '#FEE2E2' :
      '#FEF9C3',
    color:
      status === 'SELECTED' ? '#166534' :
      status === 'REJECTED' ? '#991B1B' :
      '#854D0E',
    border:
      status === 'SELECTED' ? '1px solid #86EFAC' :
      status === 'REJECTED' ? '1px solid #FECACA' :
      '1px solid #FEF08A'
  });

  if (loading) return (
    <div style={styles.loadingText}>
      Loading applications...
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
        <h2 style={styles.headerTitle}>Course Applications</h2>
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
        <table style={styles.table} className="table table-hover">
          <thead>
            <tr>
              <th style={styles.th}>Sr. No</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>State</th>
              <th style={styles.th}>Application ID</th>
              <th style={styles.th}>Course</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application, index) => (
              <tr key={application.applicationId}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{application.name}</td>
                <td style={styles.td}>{application.phone}</td>
                <td style={styles.td}>{application.city}</td>
                <td style={styles.td}>{application.state}</td>
                <td style={styles.td}>{application.applicationId}</td>
                <td style={styles.td}>{application.courseName}</td>
                <td style={styles.td}>
                  <span style={getStatusBadgeStyle(application.status || 'PENDING')}>
                    {application.status || 'PENDING'}
                  </span>
                </td>
                <td style={styles.td}>
                  {(application.status !== 'SELECTED') && (
                    <button
                      style={{...styles.selectButton, 
                        backgroundColor: application.status === 'REJECTED' ? '#22C55E' : '#22C55E'}}
                      onClick={() => handleStatus(application.applicationId, 'SELECTED')}
                      className="btn"
                    >
                      Select
                    </button>
                  )}
                  {(application.status !== 'REJECTED') && (
                    <button
                      style={{...styles.rejectButton,
                        backgroundColor: application.status === 'SELECTED' ? '#EF4444' : '#EF4444'}}
                      onClick={() => handleStatus(application.applicationId, 'REJECTED')}
                      className="btn"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourseApllications;