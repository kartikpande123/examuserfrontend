import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Search,
  IndianRupee
} from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import API_BASE_URL from "./ApiConfigCourse";
import CourseHeader from './CourseHeader'; // Import the CourseHeader component

const CourseDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours);
    
    if (hours12 >= 12) {
      period = 'PM';
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    if (hours12 === 0) {
      hours12 = 12;
    }
    
    return `${hours12}:${minutes} ${period}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/courses`),
          axios.get(`${API_BASE_URL}/categories`)
        ]);

        const sortedCourses = [...(coursesRes.data || [])].sort((a, b) => {
          const getTimestampMs = (course) => {
            if (!course.createdAt) return 0;
            if (course.createdAt._seconds) {
              return (course.createdAt._seconds * 1000) + (course.createdAt._nanoseconds / 1000000);
            }
            return 0;
          };

          const timeA = getTimestampMs(a);
          const timeB = getTimestampMs(b);
          
          return timeB - timeA;
        });

        setCourses(sortedCourses);
        setCategories(categoriesRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div style={styles.dashboardContainer}>
      <style>{`
        .course-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          border-color: #1a3b5d;
        }

        .search-input-focus:focus {
          border-color: #1a3b5d;
          box-shadow: 0 0 0 3px rgba(26, 59, 93, 0.1);
          outline: none;
        }

        .category-select-focus:focus {
          border-color: #1a3b5d;
          box-shadow: 0 0 0 3px rgba(26, 59, 93, 0.1);
          outline: none;
        }
      `}</style>
      
      {/* Use CourseHeader component */}
      <CourseHeader navigate={navigate} />

      <div className="container-fluid" style={styles.mainContainer}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="search-filter-wrapper" style={styles.searchFilterWrapper}>
              <div style={styles.searchFilterContainer}>
                <div style={styles.searchBox}>
                  <Search size={20} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-focus"
                    style={styles.searchInput}
                  />
                </div>
                <select
                  className="category-select-focus"
                  style={styles.categorySelect}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border" style={styles.spinner} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p style={styles.noCoursesText}>No courses found</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 g-md-4 px-2 px-md-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="col">
                  <div className="course-card-hover" style={styles.courseCard}>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <div style={styles.courseInfo}>
                      <div style={styles.infoItem}>
                        <Calendar size={16} style={styles.infoIcon} />
                        <span style={styles.infoText}>Date: {formatDate(course.startDate)}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Clock size={16} style={styles.infoIcon} />
                        <span style={styles.infoText}>Start Time: {formatTime(course.startTime)}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Clock size={16} style={styles.infoIcon} />
                        <span style={styles.infoText}>End Time: {formatTime(course.endTime)}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <IndianRupee size={16} style={styles.infoIcon} />
                        <span style={styles.infoText}>INR {course.fees}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Calendar size={16} style={styles.infoIcon} />
                        <span style={styles.infoText}>Last Date: {formatDate(course.lastDateToApply)}</span>
                      </div>
                    </div>
                    {new Date(course.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <div style={styles.newCourseBadge}>New</div>
                    )}
                    <button 
                      style={styles.viewDetailsBtn}
                      onClick={() => handleViewDetails(course.id)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2d5175';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(26, 59, 93, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#1a3b5d';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  mainContainer: {
    padding: '2rem 0.75rem',
  },
  searchFilterWrapper: {
    padding: '0 0.5rem',
  },
  searchFilterContainer: {
    display: 'flex',
    gap: '1rem',
    margin: '0 auto',
    maxWidth: '1200px',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: '1 1 250px',
    minWidth: '200px',
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 2.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#1a3b5d',
    pointerEvents: 'none',
  },
  categorySelect: {
    flex: '0 1 auto',
    minWidth: '200px',
    maxWidth: '300px',
    padding: '0.875rem 1.25rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 500,
  },
  courseCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.75rem',
    height: '100%',
    minHeight: '300px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  courseTitle: {
    fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#1a202c',
    lineHeight: 1.3,
    wordBreak: 'break-word',
  },
  courseInfo: {
    marginBottom: '1.5rem',
    flex: 1,
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    color: '#4a5568',
  },
  infoIcon: {
    color: '#1a3b5d',
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  infoText: {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    lineHeight: 1.5,
    wordBreak: 'break-word',
    fontWeight: 500,
  },
  newCourseBadge: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.375rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.4)',
  },
  viewDetailsBtn: {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #1a3b5d 0%, #244966 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    color: '#1a3b5d',
  },
  noCoursesText: {
    fontSize: '1.25rem',
    color: '#718096',
    margin: 0,
    fontWeight: 500,
  },
};

export default CourseDashboard;