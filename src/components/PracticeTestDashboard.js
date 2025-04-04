import React, { useState, useEffect } from 'react';
import { Form, Dropdown, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConifg';

const PracticeTestDashboard = () => {
  const [practiceTests, setPracticeTests] = useState({});
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use navigate for routing
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPracticeTests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/practice-tests`);

        if (!response.ok) {
          throw new Error('Failed to fetch practice tests');
        }

        const data = await response.json();
        setPracticeTests(data);

        // Flatten and sort tests
        const allTests = Object.entries(data).flatMap(([category, tests]) =>
          Object.entries(tests).map(([title, test]) => ({
            ...test,
            category,
            title
          }))
        ).sort((a, b) => b.createdAt - a.createdAt);

        setFilteredTests(allTests);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching practice tests:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPracticeTests();
  }, []);

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    // Filter tests
    const filtered = Object.entries(practiceTests)
      .flatMap(([cat, tests]) =>
        Object.entries(tests).map(([title, test]) => ({
          ...test,
          category: cat,
          title
        }))
      )
      .filter(test =>
        (category === 'All Categories' || test.category === category) &&
        test.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    setFilteredTests(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = Object.entries(practiceTests)
      .flatMap(([cat, tests]) =>
        Object.entries(tests).map(([title, test]) => ({
          ...test,
          category: cat,
          title
        }))
      )
      .filter(test =>
        (selectedCategory === 'All Categories' || test.category === selectedCategory) &&
        test.title.toLowerCase().includes(term.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    setFilteredTests(filtered);
  };

  // Handle exam purchase - Navigate to registration page
  const handlePurchaseExam = (exam) => {
    // Navigate to registration page with exam details
    navigate('/practicetestpurchase', { state: { selectedExam: exam } });
  };

  // Get unique categories
  const categories = ['All Categories', ...new Set(Object.keys(practiceTests))];

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
        <h2 className="m-0">Practice Test Dashboard</h2>
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
          onClick={()=>navigate("/practiceexamentry")}
        >
          My Practice Test
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
              placeholder="Search courses..."
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

      {/* Practice Test Cards */}
      <Container fluid className="p-4">
        {filteredTests.length === 0 ? (
          <div className="text-center py-5">
            <p>No practice tests found.</p>
          </div>
        ) : (
          <div className="row">
            {filteredTests.map((test, index) => (
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
                      {test.title} ({test.category})
                    </h5>
                    <div className="card-text">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar me-2"></i>
                        <span>Date: {new Date(test.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-clock me-2"></i>
                        <span>Time Limit: {test.timeLimit}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-currency-rupee me-2"></i>
                        <span>Price: {test.fees === 0 ? 'Free' : `INR ${test.fees}`}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary mt-3 w-100"
                      style={{ backgroundColor: '#1a3b5d', borderColor: '#1a3b5d' }}
                      onClick={() => handlePurchaseExam(test)}
                    >
                      {test.fees === 0 ? 'Take Free Exam' : 'Purchase Exam'}
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

export default PracticeTestDashboard;