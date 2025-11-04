import React, { useState, useEffect } from 'react';
import { Form, Dropdown, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';

const PdfSyllabusDashboard = () => {
  const [syllabi, setSyllabi] = useState({});
  const [filteredSyllabi, setFilteredSyllabi] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi`);

        if (!response.ok) {
          throw new Error('Failed to fetch PDF syllabi');
        }

        const data = await response.json();
        setSyllabi(data);

        const allSyllabi = Object.entries(data).flatMap(([category, items]) =>
          Object.entries(items).map(([title, item]) => ({
            ...item,
            category,
            title
          }))
        ).sort((a, b) => b.createdAt - a.createdAt);

        setFilteredSyllabi(allSyllabi);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching PDF syllabi:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSyllabi();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const filtered = Object.entries(syllabi)
      .flatMap(([cat, items]) =>
        Object.entries(items).map(([title, item]) => ({
          ...item,
          category: cat,
          title
        }))
      )
      .filter(item =>
        (category === 'All Categories' || item.category === category) &&
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    setFilteredSyllabi(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = Object.entries(syllabi)
      .flatMap(([cat, items]) =>
        Object.entries(items).map(([title, item]) => ({
          ...item,
          category: cat,
          title
        }))
      )
      .filter(item =>
        (selectedCategory === 'All Categories' || item.category === selectedCategory) &&
        item.title.toLowerCase().includes(term.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    setFilteredSyllabi(filtered);
  };

  const handlePurchasePdf = (syllabus) => {
    if (!syllabus.fees) {
      console.error('Fees information is missing from the syllabus:', syllabus);
    }
    
    navigate('/pdfsyllabusreg', { 
      state: { 
        selectedSyllabus: {
          ...syllabus,
          fees: syllabus.fees 
        } 
      } 
    });
  };

  const categories = ['All Categories', ...new Set(Object.keys(syllabi))];

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status" style={{ color: '#1a3b5d' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center py-3"
        style={{
          backgroundColor: '#1a3b5d',
          color: 'white',
          padding: '0 20px'
        }}
      >
        <h2 className="m-0">PDF Study Materials Dashboard</h2>
        <button
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            margin: '10px 0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          onClick={() => navigate("/pdfsyllabusentry")}
        >
          My Study Materials
        </button>
      </div>

      {/* Search and Category Section */}
      <Container
        fluid
        className="py-3 d-flex justify-content-center align-items-center"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="d-flex align-items-center"
          style={{ width: '100%', maxWidth: '800px', gap: '10px' }}
        >
          <div
            className="input-group"
            style={{
              flex: '1',
              borderRadius: '25px',
              overflow: 'hidden',
              border: '3px solid #343a40',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
            }}
          >
            <span
              className="input-group-text"
              style={{
                backgroundColor: '#f8f9fa',
                border: 'none',
                padding: '10px 15px',
              }}
            >
              <i className="bi bi-search text-dark"></i>
            </span>
            <Form.Control
              type="search"
              placeholder="Search study materials..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-control"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                padding: '10px 15px',
                boxShadow: 'none',
              }}
            />
          </div>

          <Dropdown onSelect={(eventKey) => handleCategoryChange(eventKey)}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="category-dropdown"
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid #343a40',
                borderRadius: '10px',
                padding: '10px 15px',
                transition: '0.3s ease-in-out',
              }}
            >
              {selectedCategory}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {categories.map((category) => (
                <Dropdown.Item key={category} eventKey={category}>
                  {category}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>

      {/* PDF Syllabus Cards */}
      <Container fluid className="p-4">
        {filteredSyllabi.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ color: '#1a3b5d', fontSize: '18px' }}>No PDF study materials found.</p>
          </div>
        ) : (
          <div className="row">
            {filteredSyllabi.map((syllabus, index) => (
              <div key={index} className="col-md-4 col-lg-3 mb-4">
                <div
                  className="card shadow-sm h-100"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 59, 93, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Thumbnail Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: syllabus.imageUrl ? 'transparent' : '#1a3b5d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {syllabus.imageUrl ? (
                      <img
                        src={syllabus.imageUrl}
                        alt={syllabus.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <i className="bi bi-file-earmark-pdf" style={{ fontSize: '60px' }}></i>
                        <p style={{ marginTop: '10px', fontSize: '14px' }}>No Thumbnail</p>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      {syllabus.category}
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: '20px' }}>
                    <h5
                      className="card-title"
                      style={{
                        color: '#1a3b5d',
                        fontWeight: 'bold',
                        fontSize: '22px',
                        marginBottom: '15px',
                        minHeight: '50px',
                        lineHeight: '1.4'
                      }}
                    >
                      {syllabus.title}
                    </h5>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <div
                        className="d-flex align-items-center mb-2"
                        style={{ fontSize: '14px', color: '#666' }}
                      >
                        <i className="bi bi-clock me-2" style={{ color: '#1a3b5d' }}></i>
                        <span><strong>Duration:</strong> {syllabus.duration || 'N/A'}</span>
                      </div>
                      
                      <div
                        className="d-flex align-items-center mb-2"
                        style={{ fontSize: '14px', color: '#666' }}
                      >
                        <i className="bi bi-calendar-check me-2" style={{ color: '#1a3b5d' }}></i>
                        <span><strong>Uploded:</strong> {new Date(syllabus.createdAt).toLocaleDateString()}</span>
                      </div>
                      {/* Price Badge */}
                      <div
                        className="d-flex align-items-center"
                        style={{ fontSize: '14px', color: '#666' }}
                      >
                        <i className="bi bi-currency-rupee me-2" style={{ color: '#1a3b5d' }}></i>
                        <span>
                          <strong>Price:</strong> 
                          <span style={{ 
                            marginLeft: '8px',
                            backgroundColor: syllabus.fees === 0 ? '#2196F3' : '#FF9800',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}>
                            {syllabus.fees === 0 ? 'FREE' : `₹${syllabus.fees}`}
                          </span>
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn w-100"
                      style={{
                        backgroundColor: '#1a3b5d',
                        borderColor: '#1a3b5d',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        marginTop: '10px'
                      }}
                      onClick={() => handlePurchasePdf(syllabus)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2c5282';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a3b5d';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      {syllabus.fees === 0 ? 'Get Free PDF' : 'Purchase PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default PdfSyllabusDashboard;