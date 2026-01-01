import React, { useState } from 'react';
import { Search, Video, CheckCircle } from 'lucide-react';
import API_BASE_URL from './ApiConfigCourse';

function CourseGmeetFinder() {
  const [applicationId, setApplicationId] = useState('');
  const [meetLink, setMeetLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async () => {
    if (!applicationId.trim()) {
      setError('Please enter an application ID');
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
      setApplicationData(null);
      setSearched(true);
  
      const appResponse = await fetch(`${API_BASE_URL}/applications`);
      if (!appResponse.ok) {
        throw new Error('Failed to fetch applications');
      }
  
      const { data } = await appResponse.json();
      const appData = Object.values(data).find(app => app.applicationId === applicationId);
  
      if (!appData) {
        throw new Error('Application not found');
      }

      const applicationWithStatus = {
        ...appData,
        status: appData.status || 'PENDING'
      };
  
      setApplicationData(applicationWithStatus);
  
      if (applicationWithStatus.status !== 'SELECTED') {
        setError(`Your application status is: ${applicationWithStatus.status}. Only selected applications can access the meet link.`);
        return;
      }
  
      const meetResponse = await fetch(`${API_BASE_URL}/meetlinks/all`);
      if (!meetResponse.ok) {
        throw new Error('Failed to fetch meet links');
      }
  
      const meetData = await meetResponse.json();
      const matchingMeetLink = meetData.data.find(
        link => link.courseTitle.toLowerCase() === applicationWithStatus.courseName.toLowerCase()
      );
  
      if (!matchingMeetLink) {
        throw new Error('Meet link not found for this course');
      }
  
      setMeetLink(matchingMeetLink);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const styles = {
    container: {
      maxWidth: '700px',
      margin: '40px auto',
      padding: '40px',
      backgroundColor: '#f5f7fa',
      borderRadius: '20px',
      boxShadow: '0 8px 24px rgba(26, 59, 93, 0.12)',
    },
    titleContainer: {
      textAlign: 'center',
      marginBottom: '35px',
      padding: '20px',
      background: 'linear-gradient(135deg, #1a3b5d 0%, #244966 100%)',
      borderRadius: '16px',
      border: '3px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 6px 16px rgba(26, 59, 93, 0.2)',
    },
    title: {
      fontSize: '32px',
      color: '#ffffff',
      margin: '0',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    instruction: {
      color: '#64748b',
      marginBottom: '30px',
      textAlign: 'center',
      fontSize: '17px',
      fontWeight: '500',
      letterSpacing: '0.3px',
    },
    formContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '30px',
      flexWrap: 'wrap',
    },
    input: {
      flex: '1',
      minWidth: '250px',
      padding: '14px 18px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontWeight: '500',
    },
    button: {
      padding: '14px 32px',
      background: 'linear-gradient(135deg, #1a3b5d 0%, #244966 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '16px',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 12px rgba(26, 59, 93, 0.3)',
    },
    resultContainer: {
      marginTop: '30px',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '2px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    },
    error: {
      color: '#991b1b',
      padding: '18px 22px',
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      borderRadius: '12px',
      marginTop: '20px',
      border: '2px solid #fca5a5',
      fontWeight: '600',
      fontSize: '15px',
      textAlign: 'center',
    },
    loading: {
      textAlign: 'center',
      color: '#1a3b5d',
      padding: '25px',
      fontWeight: '600',
      fontSize: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
    },
    meetLink: {
      marginTop: '25px',
      padding: '25px',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      borderRadius: '14px',
      border: '2px solid #1a3b5d',
      boxShadow: '0 4px 12px rgba(26, 59, 93, 0.1)',
    },
    linkLabel: {
      fontWeight: '700',
      color: '#1a3b5d',
      fontSize: '16px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      letterSpacing: '0.3px',
    },
    link: {
      color: '#1a3b5d',
      textDecoration: 'none',
      fontWeight: '600',
      wordBreak: 'break-all',
      fontSize: '15px',
      display: 'inline-block',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      marginTop: '8px',
      transition: 'all 0.3s ease',
      border: '1px solid #1a3b5d',
    },
    details: {
      lineHeight: '1.8',
      color: '#1a202c',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginBottom: '15px',
      padding: '12px',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
    },
    label: {
      fontWeight: '700',
      color: '#1a3b5d',
      minWidth: '140px',
      fontSize: '15px',
    },
    value: {
      fontWeight: '600',
      color: '#334155',
      fontSize: '15px',
    },
    status: {
      fontWeight: '700',
      color: '#ffffff',
      marginTop: '20px',
      padding: '14px 20px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '10px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        .gmeet-input:focus {
          border-color: #1a3b5d;
          box-shadow: 0 0 0 3px rgba(26, 59, 93, 0.15);
        }

        .gmeet-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 59, 93, 0.4);
        }

        .gmeet-button:active {
          transform: translateY(0);
        }

        .gmeet-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gmeet-link:hover {
          background-color: #f0f9ff;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(26, 59, 93, 0.15);
        }

        .result-container-animate {
          animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .gmeet-container {
            padding: 25px 20px !important;
          }

          .gmeet-title {
            font-size: 24px !important;
          }

          .gmeet-form {
            flex-direction: column;
          }

          .gmeet-input {
            width: 100%;
          }

          .gmeet-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div style={styles.titleContainer}>
        <h1 style={styles.title} className="gmeet-title">Course Link Finder</h1>
      </div>
      
      <p style={styles.instruction}>
        Enter your application ID to get your course meet link
      </p>

      <div style={styles.formContainer} className="gmeet-form">
        <input
          type="text"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Application ID"
          style={styles.input}
          className="gmeet-input"
        />
        <button 
          onClick={handleSubmit}
          style={styles.button}
          className="gmeet-button"
          disabled={isLoading}
        >
          <Search size={18} />
          {isLoading ? 'Checking...' : 'Find Link'}
        </button>
      </div>

      {isLoading && (
        <div style={styles.loading}>
          <div style={{ display: 'inline-block', marginRight: '10px' }}>⏳</div>
          Checking application status...
        </div>
      )}

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {applicationData && !error && (
        <div style={styles.resultContainer} className="result-container-animate gmeet-container">
          <div style={styles.details}>
            <div style={styles.detailItem}>
              <span style={styles.label}>Course:</span>
              <span style={styles.value}>{applicationData.courseName}</span>
            </div>
            
            <div style={styles.detailItem}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{applicationData.name}</span>
            </div>
            
            <div style={styles.detailItem}>
              <span style={styles.label}>Application Date:</span>
              <span style={styles.value}>
                {new Date(applicationData.applicationDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div style={styles.status}>
              <CheckCircle size={20} />
              Status: {applicationData.status}
            </div>
          </div>

          {meetLink && (
            <div style={styles.meetLink}>
              <div style={styles.linkLabel}>
                <Video size={20} />
                Your Class Link:
              </div>
              <a 
                href={meetLink.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
                className="gmeet-link"
              >
                {meetLink.meetLink}
              </a>
            </div>
          )}
        </div>
      )}

      {searched && !applicationData && !error && !isLoading && (
        <div style={styles.error}>
          No application found with this ID. Please check and try again.
        </div>
      )}
    </div>
  );
}

export default CourseGmeetFinder;