import React, { useState, useEffect } from 'react';
import { Form, Dropdown, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConifg';

const PdfSyllabusDashboard = () => {
  const [syllabi, setSyllabi] = useState({});
  const [filteredSyllabi, setFilteredSyllabi] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use navigate for routing
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

        // Flatten and sort syllabi
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

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    // Filter syllabi
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

  // Handle search
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

  // Handle PDF purchase - Navigate to registration page
  const handlePurchasePdf = (syllabus) => {
    // Double check that fees are included in the syllabus object
    if (!syllabus.fees) {
      console.error('Fees information is missing from the syllabus:', syllabus);
    }
    
    // Navigate to registration page with syllabus details including fees
    navigate('/pdfsyllabusreg', { 
      state: { 
        selectedSyllabus: {
          ...syllabus,
          fees: syllabus.fees 
        } 
      } 
    });
  };

  // Get unique categories
  const categories = ['All Categories', ...new Set(Object.keys(syllabi))];

  // Render loading state
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render error state
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
            backgroundColor: '#4CAF50', // Green color
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
          {/* Search Bar */}
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

          {/* Category Dropdown */}
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
            <p>No PDF study materials found.</p>
          </div>
        ) : (
          <div className="row">
            {filteredSyllabi.map((syllabus, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div
                  className="card shadow-sm h-100"
                  style={{
                    borderTop: `4px solid #1a3b5d`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <div className="card-body">
                    <h5
                      className="card-title"
                      style={{
                        color: '#1a3b5d',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    >
                      {syllabus.title} ({syllabus.category})
                    </h5>
                    <div className="card-text">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar me-2"></i>
                        <span>Created: {new Date(syllabus.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        <span>Updated: {new Date(syllabus.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-clock me-2"></i>
                        <span>Duration: {syllabus.duration || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-currency-rupee me-2"></i>
                        <span>Price: {syllabus.fees === 0 ? 'Free' : syllabus.fees ? `INR ${syllabus.fees}` : 'N/A'}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary mt-3 w-100"
                      style={{ backgroundColor: '#1a3b5d', borderColor: '#1a3b5d' }}
                      onClick={() => handlePurchasePdf(syllabus)}
                    >
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