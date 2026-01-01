import React, { useEffect, useState } from 'react';
import API_BASE_URL from './ApiConfigCourse';

function AdminCourseAllGmeets() {
  const [meetLinks, setMeetLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLinks, setFilteredLinks] = useState([]);

  useEffect(() => {
    const fetchMeetLinks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/meetlinks/all`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log('Meet Links Response:', result); // Log the response
        
        // Update this line to access the data property from your API response
        setMeetLinks(result.data);
        setFilteredLinks(result.data);
      } catch (error) {
        console.error('Error fetching meet links:', error);
      }
    };

    fetchMeetLinks();
  }, []);

  useEffect(() => {
    const filtered = meetLinks.filter(link =>
      link.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(filtered);
  }, [searchTerm, meetLinks]);

  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#ffe4e6',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '20px auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    searchBar: {
      marginBottom: '20px',
      padding: '10px',
      width: '100%',
      border: '1px solid #f8b4c4',
      borderRadius: '4px',
      outline: 'none',
    },
    linkCard: {
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 0 5px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#d6336c',
    },
    link: {
      color: '#1a73e8',
      textDecoration: 'none',
    },
    noResults: {
      textAlign: 'center',
      color: '#d6336c',
      fontStyle: 'italic',
    },
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Search by course name..."
        style={styles.searchBar}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredLinks.length > 0 ? (
        filteredLinks.map(link => (
          <div key={link.courseId} style={styles.linkCard}>
            <div style={styles.title}>{link.courseTitle}</div>
            <a 
              href={link.meetLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.link}
            >
              {link.meetLink}
            </a>
            <div>Last Updated: {new Date(link.updatedAt).toLocaleString()}</div>
          </div>
        ))
      ) : (
        <div style={styles.noResults}>No courses found</div>
      )}
    </div>
  );
}

export default AdminCourseAllGmeets;