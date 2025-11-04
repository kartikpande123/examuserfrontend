import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';

const AdminSuperUserPurchasers = () => {
  const [purchasers, setPurchasers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPurchaser, setSelectedPurchaser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });

  useEffect(() => {
    fetchPurchasers();
  }, []);

  const fetchPurchasers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/super-user-all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchasers');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPurchasers(data.purchasers || []);
      } else {
        throw new Error(data.message || 'Failed to fetch purchasers');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching purchasers:', err);
    }
  };

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
    let aValue, bValue;
    const key = sortConfig.key;
    
    if (key === 'totalPurchases') {
      aValue = calculateTotalPurchases(a.purchases);
      bValue = calculateTotalPurchases(b.purchases);
    } else if (key === 'totalAmount') {
      aValue = calculateTotalAmount(a.purchases);
      bValue = calculateTotalAmount(b.purchases);
    } else if (key === 'createdAt' || key === 'latestExpiry') {
      aValue = new Date(a[key] || 0);
      bValue = new Date(b[key] || 0);
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    } else if (key.includes('.')) {
      const keys = key.split('.');
      aValue = String(a[keys[0]]?.[keys[1]] || '').toLowerCase();
      bValue = String(b[keys[0]]?.[keys[1]] || '').toLowerCase();
    } else {
      aValue = String(a[key] || '').toLowerCase();
      bValue = String(b[key] || '').toLowerCase();
    }
    
    if (key === 'totalPurchases' || key === 'totalAmount') {
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Filter purchasers based on search term
  const filteredPurchasers = sortedPurchasers.filter(purchaser => {
    const searchString = searchTerm.toLowerCase();
    return (
      purchaser.userId?.toLowerCase().includes(searchString) ||
      purchaser.userDetails?.name?.toLowerCase().includes(searchString) ||
      purchaser.userDetails?.phoneNo?.toLowerCase().includes(searchString) ||
      purchaser.userDetails?.email?.toLowerCase().includes(searchString) ||
      purchaser.userDetails?.district?.toLowerCase().includes(searchString)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const calculateTotalPurchases = (purchases) => {
    return Object.keys(purchases || {}).length;
  };

  const calculateTotalAmount = (purchases) => {
    return Object.values(purchases || {}).reduce((total, purchase) => {
      return total + (purchase.paymentDetails?.amount || 0);
    }, 0);
  };

  const viewPurchaserDetails = (purchaser) => {
    setSelectedPurchaser(purchaser);
  };

  const closeDetails = () => {
    setSelectedPurchaser(null);
  };

  const isNewPurchaser = (createdAt) => {
    if (!createdAt) return false;
    const registrationTime = new Date(createdAt).getTime();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return registrationTime >= sevenDaysAgo.getTime();
  };

  const renderTableHeader = (label, key) => {
    return (
      <th 
        style={{ 
          padding: '12px 16px',
          backgroundColor: sortConfig.key === key ? '#1e40af' : '#f8f9fa', 
          color: sortConfig.key === key ? 'white' : '#1e40af',
          transition: 'all 0.3s ease',
          borderBottom: '1px solid #dee2e6',
          borderRight: '1px solid #dee2e6',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px'
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1e40af',
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fa' }}>
        <div style={{ 
          backgroundColor: 'rgba(220, 53, 69, 0.1)', 
          color: '#dc2626', 
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
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          borderRadius: '8px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Super User Purchaser Management</h1>
          <p style={{ marginTop: '8px', opacity: 0.9 }}>Admin Dashboard for Super User Subscriptions</p>
        </div>
        
        {/* Main Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Search and Filter */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>Purchaser Records</h2>
                <p style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>
                  Total Purchasers: {purchasers.length} | Active Subscriptions: {purchasers.filter(p => p.hasActiveSubscription).length}
                  {searchTerm ? ` | Showing ${filteredPurchasers.length} results` : ''}
                </p>
              </div>
              <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, district or user ID..."
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
                    color: '#1e40af',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>S.No</th>
                  {renderTableHeader('User ID', 'userId')}
                  {renderTableHeader('Name', 'userDetails.name')}
                  {renderTableHeader('Email', 'userDetails.email')}
                  {renderTableHeader('Phone', 'userDetails.phoneNo')}
                  {renderTableHeader('Gender', 'userDetails.gender')}
                  {renderTableHeader('Location', 'userDetails.district')}
                  {renderTableHeader('Subscription', 'hasActiveSubscription')}
                  {renderTableHeader('Latest Expiry', 'latestExpiry')}
                  {renderTableHeader('Purchases', 'totalPurchases')}
                  {renderTableHeader('Total Amount', 'totalAmount')}
                  {renderTableHeader('Created Date', 'createdAt')}
                  <th style={{ 
                    padding: '12px 16px',
                    color: '#1e40af',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    fontWeight: '700',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchasers.length > 0 ? (
                  filteredPurchasers.map((purchaser, index) => {
                    const isNew = isNewPurchaser(purchaser.createdAt);
                    return (
                      <tr 
                        key={purchaser.userId}
                        style={{
                          backgroundColor: isNew ? 'rgba(30, 64, 175, 0.08)' : 'white',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isNew ? 'rgba(30, 64, 175, 0.08)' : 'white'}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center', fontWeight: '500' }}>{index + 1}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '600', fontFamily: "'Courier New', monospace", color: '#1e40af', fontSize: '0.875rem' }}>{purchaser.userId}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '500', textTransform: 'capitalize' }}>{purchaser.userDetails?.name || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.userDetails?.email || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.userDetails?.phoneNo || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>{purchaser.userDetails?.gender || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontSize: '0.875rem', fontStyle: 'italic' }}>
                          {purchaser.userDetails?.district && purchaser.userDetails?.state 
                            ? `${purchaser.userDetails.district}, ${purchaser.userDetails.state}`
                            : 'N/A'
                          }
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px',
                            display: 'inline-block',
                            backgroundColor: purchaser.hasActiveSubscription ? '#dcfce7' : '#fee2e2',
                            color: purchaser.hasActiveSubscription ? '#166534' : '#991b1b',
                            border: purchaser.hasActiveSubscription ? '1px solid #86efac' : '1px solid #fca5a5'
                          }}>
                            {purchaser.hasActiveSubscription ? '✓ Active' : '✕ Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {formatDate(purchaser.latestExpiry)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', fontSize: '16px', color: '#1e40af' }}>
                          {calculateTotalPurchases(purchaser.purchases)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '700', fontSize: '15px', color: '#059669', textAlign: 'right' }}>
                          ₹{calculateTotalAmount(purchaser.purchases).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {formatDate(purchaser.createdAt)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                          <button
                            onClick={() => viewPurchaserDetails(purchaser)}
                            style={{
                              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
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
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.4)';
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
                    <td colSpan="13" style={{ padding: '48px 16px', textAlign: 'center', color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
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
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
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
              <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>Super User Details</h5>
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
                  color: '#1e40af', 
                  borderBottom: '2px solid #1e40af', 
                  paddingBottom: '8px', 
                  marginBottom: '16px' 
                }}>
                  Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>User ID</p>
                    <p style={{ fontWeight: '600', margin: 0, fontFamily: "'Courier New', monospace", color: '#1e40af' }}>{selectedPurchaser.userId}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Name</p>
                    <p style={{ fontWeight: '500', margin: 0, textTransform: 'capitalize' }}>{selectedPurchaser.userDetails?.name || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Phone</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.userDetails?.phoneNo || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Email</p>
                    <p style={{ fontWeight: '500', margin: 0, wordBreak: 'break-all' }}>{selectedPurchaser.userDetails?.email || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Age</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.userDetails?.age || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Gender</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.userDetails?.gender || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>District</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.userDetails?.district || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>State</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{selectedPurchaser.userDetails?.state || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Subscription Status</p>
                    <p style={{ fontWeight: '600', margin: 0, color: selectedPurchaser.hasActiveSubscription ? '#059669' : '#dc2626' }}>
                      {selectedPurchaser.hasActiveSubscription ? '✓ Active' : '✕ Inactive'}
                    </p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Latest Expiry</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{formatDate(selectedPurchaser.latestExpiry)}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Registration Date</p>
                    <p style={{ fontWeight: '500', margin: 0 }}>{formatDate(selectedPurchaser.createdAt)}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#dcfce7', border: '1px solid #86efac' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 4px 0' }}>Total Amount Paid</p>
                    <p style={{ fontWeight: '700', margin: 0, color: '#059669', fontSize: '1.1rem' }}>
                      ₹{calculateTotalAmount(selectedPurchaser.purchases).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Purchase Information */}
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 'bold', 
                  color: '#1e40af', 
                  borderBottom: '2px solid #1e40af', 
                  paddingBottom: '8px', 
                  marginBottom: '16px' 
                }}>
                  Purchase History ({calculateTotalPurchases(selectedPurchaser.purchases)} Purchases)
                </h3>
                {selectedPurchaser.purchases && Object.keys(selectedPurchaser.purchases).length > 0 ? (
                  <div style={{ overflowX: 'auto', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>S.No</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Purchase ID</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Subscription Type</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Amount</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Payment Status</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Order ID</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>Purchase Date</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>Valid Until</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedPurchaser.purchases).map(([purchaseId, purchase], index) => (
                          <tr key={purchaseId}>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', textAlign: 'center', fontWeight: '500' }}>{index + 1}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontFamily: "'Courier New', monospace", fontSize: '0.875rem', color: '#64748b' }}>{purchaseId}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>{purchase.subscriptionType || 'N/A'}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontWeight: '600', color: '#059669' }}>₹{(purchase.paymentDetails?.amount || 0).toFixed(2)}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: purchase.paymentStatus === 'completed' || purchase.paymentStatus === 'success' ? '#28a745' : purchase.paymentStatus === 'pending' ? '#ffc107' : '#dc3545',
                                color: 'white'
                              }}>
                                {purchase.paymentStatus || 'N/A'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontSize: '0.875rem', fontFamily: "'Courier New', monospace" }}>{purchase.orderId || purchase.paymentDetails?.orderId || 'N/A'}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', fontSize: '0.875rem' }}>{formatDate(purchase.purchaseDate || purchase.createdAt)}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #dee2e6', fontSize: '0.875rem' }}>{formatDate(purchase.validUntil || purchase.expiryDate)}</td>
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
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
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
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.4)';
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
};

export default AdminSuperUserPurchasers;