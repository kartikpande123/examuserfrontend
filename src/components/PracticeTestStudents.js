import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';
import { Aperture } from 'lucide-react';

export default function PracticeTestStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'registrationDate', direction: 'descending' }); // Default sort by newest registration

  // Fetch students data from API
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.get(`${API_BASE_URL}/api/practicetestpurchasedstudents`, {
          timeout: 10000,
        });
  
        console.log("Raw API Response:", response); // Debugging
  
        if (!response.data || !response.data.success || !response.data.data) {
          throw new Error("Invalid data format received");
        }
  
        const studentsData = response.data.data;
        console.log("Processed Data:", studentsData); // Debugging
  
        const studentsArray = Object.entries(studentsData).map(([id, studentData]) => ({
          id,
          name: studentData.name || "N/A",
          email: studentData.email || "N/A",
          phone: studentData.phoneNo || "N/A",
          gender: studentData.gender || "N/A",
          age: studentData.age || "N/A",
          state: studentData.state || "N/A",
          district: studentData.district || "N/A",
          totalPaid: (studentData.purchases || []).reduce(
            (sum, purchase) => sum + (purchase.paymentDetails?.amount || 0),
            0
          ),
          registrationDate: studentData.registrationDate || "N/A",
          lastUpdated: studentData.lastUpdated || "N/A",
          studentId: studentData.studentId || "N/A",
          purchases: studentData.purchases || [],
          examAnalytics: studentData.ExamAnalytics || {},
        }));
  
        setStudents(studentsArray);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError(error.message || "Failed to fetch students data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudents();
  }, []);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort students based on current sort configuration
  const sortedStudents = [...students].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) return 0;
    
    if (sortConfig.key === 'totalPaid') {
      // Numeric sort for financial data
      return sortConfig.direction === 'ascending' 
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    } else if (sortConfig.key === 'registrationDate') {
      // Date sort for registration date
      const dateA = new Date(a[sortConfig.key] || 0);
      const dateB = new Date(b[sortConfig.key] || 0);
      return sortConfig.direction === 'ascending' 
        ? dateA - dateB 
        : dateB - dateA;
    } else {
      // String sort for text data
      const aValue = String(a[sortConfig.key]).toLowerCase();
      const bValue = String(b[sortConfig.key]).toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
  });

  // Filter students based on search term
  const filteredStudents = sortedStudents.filter(student => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchString) ||
      student.email.toLowerCase().includes(searchString) ||
      student.phone.toLowerCase().includes(searchString) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchString))
    );
  });

  // View student details and scroll to top of modal
  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    // Set timeout to ensure modal is rendered before scrolling
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 100);
  };

  // Close student details modal
  const closeDetails = () => {
    setSelectedStudent(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Render table header with sort functionality
  const renderTableHeader = (label, key) => {
    return (
      <th 
        className="px-4 py-3 cursor-pointer"
        style={{ 
          backgroundColor: sortConfig.key === key ? '#1e5bb0' : '#f8f9fa', 
          color: sortConfig.key === key ? 'white' : '#1e5bb0',
          transition: 'all 0.3s ease',
          borderBottom: '1px solid #dee2e6',
          borderRight: '1px solid #dee2e6'
        }}
        onClick={() => requestSort(key)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span>{label}</span>
          {sortConfig.key === key && (
            <span className="ml-1">
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Check if a student is new (registered within last 7 days)
  const isNewStudent = (registrationDate) => {
    if (!registrationDate) return false;
    const registrationTime = new Date(registrationDate).getTime();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return registrationTime >= sevenDaysAgo.getTime();
  };

  const headerStyle = {
    backgroundImage: 'linear-gradient(to right, #1a4b8c, #2d7dd2)',
    borderRadius: '8px 8px 0 0',
    padding: '20px 25px',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  // Define common table styles
  const tableStyles = {
    cellStyle: {
      borderBottom: '1px solid #dee2e6',
      borderRight: '1px solid #dee2e6',
      verticalAlign: 'middle'
    },
    tableStyle: {
      borderCollapse: 'separate',
      borderSpacing: 0,
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    headerCellStyle: {
      backgroundColor: '#f8f9fa',
      color: '#1e5bb0',
      borderBottom: '1px solid #dee2e6',
      borderRight: '1px solid #dee2e6'
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', backgroundColor: '#f8f9fa'}}>
      <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', backgroundColor: '#f8f9fa'}}>
      <div className="bg-danger bg-opacity-10 text-danger p-4 rounded shadow-sm" style={{maxWidth: '500px'}}>
        <h3 className="fw-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f5f7fa', padding: '20px'}}>
      <div className="container-fluid">
        {/* Header */}
        <div className="card mb-4 border-0 shadow-sm">
          <div style={headerStyle}>
            <h1 className="display-6 fw-bold mb-0">Practice Student Purchase</h1>
            <p className="mt-2 text-white-50">Admin Dashboard for Student Practice Tests</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="card border-0 shadow-sm mb-4">
          {/* Search and Filter */}
          <div className="card-header bg-white border-bottom border-light p-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <h2 className="h4 fw-bold text-primary mb-0">Student Records</h2>
                <p className="text-muted small mt-1 mb-0">
                  Displaying {filteredStudents.length} students 
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                  {sortConfig.key === 'registrationDate' && sortConfig.direction === 'descending' ? 
                    ' (newest first)' : ''}
                </p>
              </div>
              <div className="col-md-6">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone or ID..."
                    className="form-control form-control-lg ps-5"
                    style={{borderRadius: '50px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search position-absolute text-muted" viewBox="0 0 16 16" style={{left: '20px', top: '50%', transform: 'translateY(-50%)'}}>
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Students Table */}
          <div className="table-responsive p-0">
            <table className="table table-hover mb-0" style={tableStyles.tableStyle}>
              <thead>
                <tr>
                  <th 
                    className="px-4 py-3 text-primary"
                    style={tableStyles.headerCellStyle}
                  >
                    S.No
                  </th>
                  {renderTableHeader('Student ID', 'studentId')}
                  {renderTableHeader('Name', 'name')}
                  {renderTableHeader('Email', 'email')}
                  {renderTableHeader('Phone', 'phone')}
                  {renderTableHeader('Total Paid', 'totalPaid')}
                  {renderTableHeader('Registration Date', 'registrationDate')}
                  <th className="px-4 py-3 text-primary" style={tableStyles.headerCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => {
                    const isNew = isNewStudent(student.registrationDate);
                    return (
                      <tr key={student.id} 
                        style={{
                          transition: 'background-color 0.2s ease',
                          backgroundColor: isNew ? 'rgba(25, 135, 84, 0.1)' : ''
                        }}
                      >
                        <td className="px-4 py-3 fw-medium text-center" style={tableStyles.cellStyle}>{index + 1}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{student.studentId || 'N/A'}</td>
                        <td className="px-4 py-3 fw-medium" style={tableStyles.cellStyle}>
                          {student.name}
                        </td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{student.email}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{student.phone}</td>
                        <td className="px-4 py-3 fw-medium" style={tableStyles.cellStyle}>₹{student.totalPaid.toFixed(2)}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{formatDate(student.registrationDate)}</td>
                        <td className="px-4 py-3" style={{...tableStyles.cellStyle, borderRight: 'none'}}>
                          <button
                            onClick={() => viewStudentDetails(student)}
                            className="btn btn-primary btn-sm px-3 py-2"
                            style={{
                              backgroundColor: '#1e5bb0', 
                              border: 'none', 
                              borderRadius: '4px',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Show Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted" style={{borderBottom: '1px solid #dee2e6'}}>
                      No students found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" style={{maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px'}}>
              <div className="modal-header sticky-top" style={{backgroundImage: 'linear-gradient(to right, #1a4b8c, #2d7dd2)', color: 'white'}}>
                <h5 className="modal-title fw-bold">Student Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeDetails}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body">
                {/* Personal Information */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold text-primary border-bottom pb-2 mb-3">
                    Personal Information
                  </h3>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Student ID</p>
                        <p className="fw-medium mb-0">{selectedStudent.studentId || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Name</p>
                        <p className="fw-medium mb-0">{selectedStudent.name}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Email</p>
                        <p className="fw-medium mb-0">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Phone</p>
                        <p className="fw-medium mb-0">{selectedStudent.phone}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Gender</p>
                        <p className="fw-medium mb-0">{selectedStudent.gender}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Age</p>
                        <p className="fw-medium mb-0">{selectedStudent.age}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">State</p>
                        <p className="fw-medium mb-0">{selectedStudent.state}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">District</p>
                        <p className="fw-medium mb-0">{selectedStudent.district}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Registration Date</p>
                        <p className="fw-medium mb-0">{formatDate(selectedStudent.registrationDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Purchase Information */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold text-primary border-bottom pb-2 mb-3">Purchase Information</h3>
                  {selectedStudent.purchases && selectedStudent.purchases.length > 0 ? (
                    <div className="table-responsive rounded shadow-sm">
                      <table className="table table-hover mb-0" style={tableStyles.tableStyle}>
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>S.No</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Title</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Category</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Duration</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Time Limit</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Amount</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Payment Status</th>
                            <th className="px-3 py-2 text-primary small" style={{...tableStyles.headerCellStyle, borderRight: 'none'}}>Purchase Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.purchases.map((purchase, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-center" style={tableStyles.cellStyle}>{index + 1}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.examDetails?.title || 'N/A'}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.examDetails?.category || 'N/A'}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.examDetails?.duration || 'N/A'}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.examDetails?.timeLimit || 'N/A'}</td>
                              <td className="px-3 py-2 fw-medium" style={tableStyles.cellStyle}>₹{(purchase.paymentDetails?.amount || 0).toFixed(2)}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>
                                <span className={`badge rounded-pill px-3 py-2 ${
                                  purchase.paymentDetails?.status === 'captured' || purchase.paymentDetails?.status === 'free' 
                                    ? 'bg-success' 
                                    : 'bg-warning'
                                }`} style={{fontSize: '0.75rem'}}>
                                  {purchase.paymentDetails?.status || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-2" style={{...tableStyles.cellStyle, borderRight: 'none'}}>{formatDate(purchase.purchaseDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-light text-center py-4" style={{border: '1px solid #dee2e6', borderRadius: '8px'}}>
                      <p className="text-muted mb-0">No purchase records found</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeDetails}
                  className="btn btn-primary px-4 py-2"
                  style={{backgroundColor: '#1e5bb0', border: 'none'}}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}