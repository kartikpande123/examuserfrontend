import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfigCourse';

const AdminCourseCandidates = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);

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
            key
          }))
          .filter(app => app.status === 'SELECTED');
        
        // Sort by selection date (newest first)
        const sortedApplications = applicationsArray.sort((a, b) => {
          const dateA = new Date(a.selectedAt || a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.selectedAt || b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });
        
        setSelectedCandidates(sortedApplications);
        
        // Extract unique courses
        const uniqueCourses = [...new Set(applicationsArray.map(app => app.courseName))];
        setCourses(uniqueCourses);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch selected candidates');
      setLoading(false);
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
    statusBadge: {
      backgroundColor: '#DCFCE7',
      color: '#166534',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      border: '1px solid #86EFAC'
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
          Selected Candidates 
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
                <th style={styles.th}>Selection Date</th>
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
                    {new Date(candidate.selectedAt || candidate.updatedAt || candidate.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.noDataText}>
            No selected candidates found for the current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseCandidates;