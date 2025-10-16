import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';

export default function PdfSyllabusPurchasers() {
  const [purchasers, setPurchasers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPurchaser, setSelectedPurchaser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' }); // Default sort by newest registration

  // Fetch purchasers data from API
  useEffect(() => {
    const fetchPurchasers = async () => {
      try {
        setLoading(true);
        // Use the API endpoint you provided
        const response = await fetch(`${API_BASE_URL}/api/pdfsyllabuspurchasers`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch data');
        }

        // Process the data into a more usable format
        const purchasersArray = [];
        
        for (const [id, purchaserData] of Object.entries(result.data)) {
          // Calculate total PDFs purchased by student
          const totalPurchases = purchaserData.purchases ? Object.keys(purchaserData.purchases).length : 0;
          
          // Get total amount paid
          const totalPaid = purchaserData.purchases ? Object.values(purchaserData.purchases).reduce((sum, purchase) => {
            return sum + (purchase.paymentAmount || 0);
          }, 0) : 0;
          
          // Format all purchases into array
          const purchasesArray = purchaserData.purchases ? 
            Object.entries(purchaserData.purchases).map(([purchaseId, purchaseData]) => ({
              purchaseId,
              ...purchaseData
            })) : [];
          
          // Format purchaser data for our component
          purchasersArray.push({
            id,
            name: purchaserData.name || 'N/A',
            email: purchaserData.email || 'N/A',
            age: purchaserData.age || 'N/A',
            gender: purchaserData.gender || 'N/A',
            phoneNo: purchaserData.phoneNo || 'N/A',
            district: purchaserData.district || 'N/A',
            state: purchaserData.state || 'N/A',
            createdAt: purchaserData.createdAt,
            updatedAt: purchaserData.updatedAt,
            totalPurchases,
            totalPaid,
            purchases: purchasesArray
          });
        }
        
        setPurchasers(purchasersArray);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch purchasers data');
        setLoading(false);
        console.error('Error fetching purchasers:', err);
      }
    };

    fetchPurchasers();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort purchasers based on current sort configuration
  const sortedPurchasers = [...purchasers].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) return 0;
    
    if (sortConfig.key === 'totalPaid' || sortConfig.key === 'totalPurchases') {
      // Numeric sort for financial data and counts
      return sortConfig.direction === 'ascending' 
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    } else if (sortConfig.key === 'createdAt') {
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

  // Filter purchasers based on search term
  const filteredPurchasers = sortedPurchasers.filter(purchaser => {
    const searchString = searchTerm.toLowerCase();
    return (
      purchaser.name.toLowerCase().includes(searchString) ||
      purchaser.phoneNo.toLowerCase().includes(searchString) ||
      (purchaser.email && purchaser.email.toLowerCase().includes(searchString)) ||
      purchaser.district.toLowerCase().includes(searchString) ||
      purchaser.id.toLowerCase().includes(searchString)
    );
  });

  // View purchaser details and scroll to top of modal
  const viewPurchaserDetails = (purchaser) => {
    setSelectedPurchaser(purchaser);
    // Set timeout to ensure modal is rendered before scrolling
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 100);
  };

  // Close purchaser details modal
  const closeDetails = () => {
    setSelectedPurchaser(null);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
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

  // Check if a purchaser is new (registered within last 7 days)
  const isNewPurchaser = (createdAt) => {
    if (!createdAt) return false;
    const registrationTime = new Date(createdAt).getTime();
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
            <h1 className="display-6 fw-bold mb-0">PDF Syllabus Purchasers</h1>
            <p className="mt-2 text-white-50">Admin Dashboard for PDF Syllabus Sales</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="card border-0 shadow-sm mb-4">
          {/* Search and Filter */}
          <div className="card-header bg-white border-bottom border-light p-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <h2 className="h4 fw-bold text-primary mb-0">Purchaser Records</h2>
                <p className="text-muted small mt-1 mb-0">
                  Displaying {filteredPurchasers.length} purchasers 
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                  {sortConfig.key === 'createdAt' && sortConfig.direction === 'descending' ? 
                    ' (newest first)' : ''}
                </p>
              </div>
              <div className="col-md-6">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, district or student ID..."
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
          
          {/* Purchasers Table */}
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
                  {renderTableHeader('Student ID', 'id')}
                  {renderTableHeader('Name', 'name')}
                  {renderTableHeader('Email', 'email')}
                  {renderTableHeader('Phone', 'phoneNo')}
                  {renderTableHeader('Gender', 'gender')}
                  {renderTableHeader('District', 'district')}
                  {renderTableHeader('State', 'state')}
                  {renderTableHeader('Total PDFs', 'totalPurchases')}
                  {renderTableHeader('Total Paid', 'totalPaid')}
                  {renderTableHeader('Registration Date', 'createdAt')}
                  <th className="px-4 py-3 text-primary" style={tableStyles.headerCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchasers.length > 0 ? (
                  filteredPurchasers.map((purchaser, index) => {
                    const isNew = isNewPurchaser(purchaser.createdAt);
                    return (
                      <tr key={purchaser.id} 
                        style={{
                          transition: 'background-color 0.2s ease',
                          backgroundColor: isNew ? 'rgba(25, 135, 84, 0.1)' : ''
                        }}
                      >
                        <td className="px-4 py-3 fw-medium text-center" style={tableStyles.cellStyle}>{index + 1}</td>
                        <td className="px-4 py-3 fw-medium small" style={tableStyles.cellStyle}>{purchaser.id}</td>
                        <td className="px-4 py-3 fw-medium" style={tableStyles.cellStyle}>{purchaser.name}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{purchaser.email}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{purchaser.phoneNo}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{purchaser.gender}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{purchaser.district}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{purchaser.state}</td>
                        <td className="px-4 py-3 fw-medium text-center" style={tableStyles.cellStyle}>{purchaser.totalPurchases}</td>
                        <td className="px-4 py-3 fw-medium" style={tableStyles.cellStyle}>₹{purchaser.totalPaid.toFixed(2)}</td>
                        <td className="px-4 py-3" style={tableStyles.cellStyle}>{formatDate(purchaser.createdAt)}</td>
                        <td className="px-4 py-3" style={{...tableStyles.cellStyle, borderRight: 'none'}}>
                          <button
                            onClick={() => viewPurchaserDetails(purchaser)}
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
                    <td colSpan="12" className="text-center py-5 text-muted" style={{borderBottom: '1px solid #dee2e6'}}>
                      No purchasers found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Purchaser Details Modal */}
      {selectedPurchaser && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" style={{maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px'}}>
              <div className="modal-header sticky-top" style={{backgroundImage: 'linear-gradient(to right, #1a4b8c, #2d7dd2)', color: 'white'}}>
                <h5 className="modal-title fw-bold">Purchaser Details</h5>
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
                    <div className="col-12">
                      <div className="p-3 rounded" style={{backgroundColor: '#f8f9ff', border: '1px solid #dce1ff'}}>
                        <p className="small text-muted mb-1">Student ID</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.id}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Name</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.name}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Phone</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.phoneNo}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Email</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.email}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Age</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.age}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Gender</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.gender}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">District</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.district}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">State</p>
                        <p className="fw-medium mb-0">{selectedPurchaser.state}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Registration Date</p>
                        <p className="fw-medium mb-0">{formatDate(selectedPurchaser.createdAt)}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded" style={{backgroundColor: '#f0f7ff', border: '1px solid #d0e2ff'}}>
                        <p className="small text-muted mb-1">Last Updated</p>
                        <p className="fw-medium mb-0">{formatDate(selectedPurchaser.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Purchase Information */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold text-primary border-bottom pb-2 mb-3">PDF Syllabus Purchases</h3>
                  {selectedPurchaser.purchases && selectedPurchaser.purchases.length > 0 ? (
                    <div className="table-responsive rounded shadow-sm">
                      <table className="table table-hover mb-0" style={tableStyles.tableStyle}>
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>S.No</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Title</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Category</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Duration</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Price</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Payment Status</th>
                            <th className="px-3 py-2 text-primary small" style={tableStyles.headerCellStyle}>Order ID</th>
                            <th className="px-3 py-2 text-primary small" style={{...tableStyles.headerCellStyle, borderRight: 'none'}}>Purchase Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPurchaser.purchases.map((purchase, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-center" style={tableStyles.cellStyle}>{index + 1}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.syllabusTitle || 'N/A'}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.syllabusCategory || 'N/A'}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>{purchase.syllabusDuration || 'N/A'}</td>
                              <td className="px-3 py-2 fw-medium" style={tableStyles.cellStyle}>₹{(purchase.paymentAmount || 0).toFixed(2)}</td>
                              <td className="px-3 py-2" style={tableStyles.cellStyle}>
                                <span className={`badge rounded-pill px-3 py-2 ${
                                  purchase.paymentStatus === 'completed' ? 'bg-success' : 'bg-warning'
                                }`} style={{fontSize: '0.75rem'}}>
                                  {purchase.paymentStatus || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-2 small" style={tableStyles.cellStyle}>{purchase.orderId || 'N/A'}</td>
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