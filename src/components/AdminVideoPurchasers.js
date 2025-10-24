import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';
export default function AdminVideoPurchasers() {
  const [purchasers, setPurchasers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPurchaser, setSelectedPurchaser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });

  // Fetch purchasers data from API
  useEffect(() => {
    const fetchPurchasers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/videosyllabuspurchasers`);
        
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
          // Calculate total videos purchased by student
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
      return sortConfig.direction === 'ascending' 
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    } else if (sortConfig.key === 'createdAt') {
      const dateA = new Date(a[sortConfig.key] || 0);
      const dateB = new Date(b[sortConfig.key] || 0);
      return sortConfig.direction === 'ascending' 
        ? dateA - dateB 
        : dateB - dateA;
    } else {
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

  // View purchaser details
  const viewPurchaserDetails = (purchaser) => {
    setSelectedPurchaser(purchaser);
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

  // Check if a purchaser is new (registered within last 7 days)
  const isNewPurchaser = (createdAt) => {
    if (!createdAt) return false;
    const registrationTime = new Date(createdAt).getTime();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return registrationTime >= sevenDaysAgo.getTime();
  };

  // Render table header with sort functionality
  const renderTableHeader = (label, key) => {
    return (
      <th 
        className="px-4 py-3 cursor-pointer select-none"
        style={{ 
          backgroundColor: sortConfig.key === key ? '#667eea' : '#f8f9fa', 
          color: sortConfig.key === key ? 'white' : '#667eea',
          transition: 'all 0.3s ease',
          borderBottom: '1px solid #dee2e6',
          borderRight: '1px solid #dee2e6',
          cursor: 'pointer'
        }}
        onClick={() => requestSort(key)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{label}</span>
          {sortConfig.key === key && (
            <span style={{ marginLeft: '4px' }}>
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
                  <div style={{ textAlign: 'center' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#666' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
        <div style={{ 
          backgroundColor: 'rgba(220, 53, 69, 0.1)', 
          color: '#667eea', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '500px' 
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Video Syllabus Purchasers</h1>
          <p style={{ marginTop: '8px', opacity: 0.9 }}>Admin Dashboard for Video Syllabus Sales</p>
        </div>
        
        {/* Main Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Search and Filter */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea', margin: 0 }}>Purchaser Records</h2>
                <p style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>
                  Displaying {filteredPurchasers.length} purchasers 
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                  {sortConfig.key === 'createdAt' && sortConfig.direction === 'descending' ? ' (newest first)' : ''}
                </p>
              </div>
              <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, district or student ID..."
                  style={{ 
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    borderRadius: '50px',
                    border: '1px solid #dee2e6',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  fill="#6c757d" 
                  viewBox="0 0 16 16"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Purchasers Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    padding: '12px 16px',
                    color: '#667eea',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    textAlign: 'center'
                  }}>S.No</th>
                  {renderTableHeader('Student ID', 'id')}
                  {renderTableHeader('Name', 'name')}
                  {renderTableHeader('Email', 'email')}
                  {renderTableHeader('Phone', 'phoneNo')}
                  {renderTableHeader('Gender', 'gender')}
                  {renderTableHeader('District', 'district')}
                  {renderTableHeader('State', 'state')}
                  {renderTableHeader('Total Videos', 'totalPurchases')}
                  {renderTableHeader('Total Paid', 'totalPaid')}
                  {renderTableHeader('Registration Date', 'createdAt')}
                  <th style={{ 
                    padding: '12px 16px',
                    color: '#667eea',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchasers.length > 0 ? (
                  filteredPurchasers.map((purchaser, index) => {
                    const isNew = isNewPurchaser(purchaser.createdAt);
                    return (
                      <tr 
                        key={purchaser.id}
                        style={{
                          backgroundColor: isNew ? 'rgba(102, 126, 234, 0.08)' : 'white',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isNew ? 'rgba(102, 126, 234, 0.08)' : 'white'}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center', fontWeight: '500' }}>{index + 1}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '500', fontSize: '0.875rem' }}>{purchaser.id}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>{purchaser.name}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.email}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.phoneNo}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.gender}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.district}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.state}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center', fontWeight: '500' }}>{purchaser.totalPurchases}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>₹{purchaser.totalPaid.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{formatDate(purchaser.createdAt)}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                          <button
                            onClick={() => viewPurchaserDetails(purchaser)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
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
                    <td colSpan="12" style={{ padding: '48px 16px', textAlign: 'center', color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
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
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
            padding: '20px'
          }}
          onClick={closeDetails}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 24px',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>Purchaser Details</h5>
              <button 
                onClick={closeDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Personal Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 'bold', 
                  color: '#667eea', 
                  borderBottom: '2px solid #667eea', 
                  paddingBottom: '8px', 
                  marginBottom: '16px' 
                }}>
                  Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f3ff', border: '1px solid #d6dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Student ID</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.id}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Name</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.name}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Phone</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.phoneNo}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Email</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.email}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Age</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.age}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Gender</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.gender}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>District</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.district}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>State</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.state}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Registration Date</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{formatDate(selectedPurchaser.createdAt)}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8f4ff', border: '1px solid #e8dcff' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Last Updated</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{formatDate(selectedPurchaser.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* Purchase Information */}
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 'bold', 
                  color: '#667eea', 
                  borderBottom: '2px solid #667eea', 
                  paddingBottom: '8px', 
                  marginBottom: '16px' 
                }}>
                  Video Syllabus Purchases
                </h3>
                {selectedPurchaser.purchases && selectedPurchaser.purchases.length > 0 ? (
                  <div style={{ overflowX: 'auto', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>S.No</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Title</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Category</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Duration</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Price</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Payment Status</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Order ID</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#667eea', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>Purchase Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPurchaser.purchases.map((purchase, index) => (
                          <tr key={index}>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchase.syllabusDuration || 'N/A'}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>₹{(purchase.paymentAmount || 0).toFixed(2)}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: purchase.paymentStatus === 'completed' ? '#28a745' : '#ffc107',
                                color: 'white'
                              }}>
                                {purchase.paymentStatus || 'N/A'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontSize: '0.875rem' }}>{purchase.orderId || 'N/A'}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6' }}>{formatDate(purchase.purchaseDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '32px', 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px' 
                  }}>
                    <p style={{ color: '#6c757d', margin: 0 }}>No purchase records found</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeDetails}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}