import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import API_BASE_URL from './ApiConfigCourse';
import {useNavigate} from "react-router-dom"

const AdminCourseGmeet = () => {
  const [courses, setCourses] = useState([]);
  const [meetLinks, setMeetLinks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [selectedMeetLink, setSelectedMeetLink] = useState(null);
  const navigate = useNavigate();

  const styles = {
    card: {
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: '#fff'
    },
    header: {
      backgroundColor: '#fce7f3',
      margin: '-20px -20px 20px -20px',
      padding: '15px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      textAlign: 'center'
    },
    title: {
      color: '#be185d',
      fontSize: '24px',
      fontWeight: '600',
      margin: '0'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #fce7f3',
      borderRadius: '4px'
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#db2777',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '10px'
    },
    secondaryButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#9d174d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '20px'
    },
    alert: {
      padding: '12px',
      marginBottom: '15px',
      borderRadius: '4px'
    },
    error: {
      backgroundColor: '#fee2e2',
      border: '1px solid #fca5a5',
      color: '#991b1b'
    },
    success: {
      backgroundColor: '#dcfce7',
      border: '1px solid #86efac',
      color: '#166534'
    },
    linkCard: {
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#fce7f3',
      borderRadius: '4px',
      border: '1px solid #fbcfe8'
    },
    linkTitle: {
      color: '#be185d',
      fontWeight: '500',
      marginBottom: '5px'
    },
    link: {
      color: '#db2777',
      textDecoration: 'none'
    },
    linksContainer: {
      marginTop: '30px'
    }
  };

  function goToGmeetLinks(){
    navigate("/courseallgmeets")
  }

  useEffect(() => {
    fetchCourses();
    fetchMeetLinks();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      setError('Failed to fetch courses');
    }
  };

  const fetchMeetLinks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/meet`);
      const data = await response.json();
      setMeetLinks(data || []);
    } catch (error) {
      setError('Failed to fetch meet links');
      setMeetLinks([]);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    const selected = courses.find(course => course.id === courseId);
    setSelectedCourseTitle(selected ? selected.title : '');
    
    if (meetLinks && Array.isArray(meetLinks)) {
      const existingMeetLink = meetLinks.find(link => link.courseId === courseId);
      if (existingMeetLink) {
        setSelectedMeetLink(existingMeetLink);
        setMeetLink(existingMeetLink.meetLink);
      } else {
        setSelectedMeetLink(null);
        setMeetLink('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCourse || !selectedCourseTitle || !meetLink) {
      setError('Please select a course and enter a Google Meet link');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/courses/meet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          courseTitle: selectedCourseTitle,
          meetLink,
        }),
      });

      if (!response.ok) throw new Error('Failed to save meet link');
      
      setSuccess('Google Meet link saved successfully');
      setMeetLink('');
      setSelectedCourse('');
      setSelectedCourseTitle('');
      setSelectedMeetLink(null);
      fetchMeetLinks();
    } catch (error) {
      setError('Failed to save Google Meet link');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Add Google Meet Link to Course</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Course</label>
          <select 
            value={selectedCourse}
            onChange={handleCourseChange}
            style={styles.input}
            className="form-select"
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Google Meet Link</label>
          <input
            type="url"
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            style={styles.input}
            className="form-control"
          />
        </div>

        {error && (
          <div style={{...styles.alert, ...styles.error}}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{...styles.alert, ...styles.success}}>
            {success}
          </div>
        )}

        <button type="submit" style={styles.button}>
          Save Meet Link
        </button>
      </form>

      {selectedMeetLink && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={styles.title}>Selected Course Meet Link</h3>
          <div style={styles.linkCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={styles.linkTitle}>{selectedMeetLink.courseTitle}</h4>
                <a 
                  href={selectedMeetLink.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  {selectedMeetLink.meetLink}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        style={styles.secondaryButton}
        onClick={goToGmeetLinks}
      >
        Show All G-Meet Links
      </button>

      {showAllLinks && meetLinks.length > 0 && (
        <div style={styles.linksContainer}>
          <h3 style={styles.title}>All Google Meet Links</h3>
          {meetLinks.map((link) => (
            <div key={link.courseId} style={styles.linkCard}>
              <h4 style={styles.linkTitle}>{link.courseTitle}</h4>
              <a 
                href={link.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                {link.meetLink}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourseGmeet;