import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import API_BASE_URL from './ApiConfigCourse';

const CourseStatusCheck = () => {
  const [applicationId, setApplicationId] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!applicationId.trim()) {
      setError('Please enter an application ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const application = result.data[applicationId];
        if (application) {
          setApplicationData({
            ...application,
            status: application.status || 'PENDING'
          });
          setError('');
        } else {
          setError('Application not found');
          setApplicationData(null);
        }
      } else {
        setError('Failed to fetch application details');
      }
    } catch (err) {
      setError('Error checking application status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const baseStyle = {
      container: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '22px 45px',
        borderRadius: '12px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
        color: 'white',
        fontWeight: '700',
        fontSize: '18px',
        letterSpacing: '0.5px',
      },
      text: {
        marginLeft: '10px',
        fontWeight: '700'
      }
    };

    switch (status) {
      case 'SELECTED':
        return {
          container: {
            ...baseStyle.container,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          },
          text: baseStyle.text
        };
      case 'REJECTED':
        return {
          container: {
            ...baseStyle.container,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          },
          text: baseStyle.text
        };
      default:
        return {
          container: {
            ...baseStyle.container,
            background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
          },
          text: baseStyle.text
        };
    }
  };

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '40px auto',
      padding: '40px',
      backgroundColor: '#f5f7fa',
      borderRadius: '20px',
      boxShadow: '0 8px 24px rgba(26, 59, 93, 0.12)',
    },
    titleContainer: {
      textAlign: 'center',
      marginBottom: '40px',
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
    inputContainer: {
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontSize: '16px',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(26, 59, 93, 0.3)',
    },
    alert: {
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '25px',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '15px',
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      color: '#991b1b',
      border: '2px solid #fca5a5',
    },
    statusContainer: {
      textAlign: 'center',
      marginBottom: '35px',
      padding: '25px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '14px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      border: '2px solid #e2e8f0',
      transition: 'all 0.3s ease',
      height: '100%',
    },
    cardLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    cardValue: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#1a202c',
      margin: '0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .status-input:focus {
          border-color: #1a3b5d;
          box-shadow: 0 0 0 3px rgba(26, 59, 93, 0.15);
        }

        .status-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 59, 93, 0.4);
        }

        .status-button:active {
          transform: translateY(0);
        }

        .status-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(26, 59, 93, 0.12);
          border-color: #1a3b5d;
        }

        @media (max-width: 768px) {
          .status-container {
            padding: 25px 15px !important;
          }

          .status-title {
            font-size: 24px !important;
          }

          .status-input-container {
            flex-direction: column;
          }

          .status-input {
            width: 100%;
          }

          .status-button {
            width: 100%;
          }

          .status-badge {
            padding: 16px 30px !important;
            font-size: 16px !important;
          }
        }
      `}</style>

      <div style={styles.titleContainer}>
        <h1 style={styles.title} className="status-title">Application Status Checker</h1>
      </div>

      <div style={styles.inputContainer} className="status-input-container">
        <input
          type="text"
          className="status-input"
          placeholder="Enter Application ID"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkStatus()}
          style={styles.input}
        />
        <button 
          className="status-button"
          onClick={checkStatus}
          disabled={loading}
          style={styles.button}
        >
          <Search size={18} />
          <span>{loading ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      {error && (
        <div style={styles.alert}>
          {error}
        </div>
      )}

      {applicationData && (
        <div>
          <div style={styles.statusContainer}>
            <div style={getStatusStyle(applicationData.status).container} className="status-badge">
              {applicationData.status === 'SELECTED' && <CheckCircle size={28} />}
              {applicationData.status === 'PENDING' && <Clock size={28} />}
              {applicationData.status === 'REJECTED' && <XCircle size={28} />}
              <span style={getStatusStyle(applicationData.status).text}>
                {applicationData.status}
              </span>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.card} className="info-card">
              <div style={styles.cardLabel}>Applicant Name</div>
              <p style={styles.cardValue}>{applicationData.name}</p>
            </div>
            
            <div style={styles.card} className="info-card">
              <div style={styles.cardLabel}>Course Name</div>
              <p style={styles.cardValue}>{applicationData.courseName}</p>
            </div>
            
            <div style={styles.card} className="info-card">
              <div style={styles.cardLabel}>City</div>
              <p style={styles.cardValue}>{applicationData.city}</p>
            </div>
            
            <div style={styles.card} className="info-card">
              <div style={styles.cardLabel}>State</div>
              <p style={styles.cardValue}>{applicationData.state}</p>
            </div>
            
            <div style={styles.card} className="info-card">
              <div style={styles.cardLabel}>Application Date</div>
              <p style={styles.cardValue}>
                {new Date(applicationData.applicationDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <div style={styles.card} className="info-card">
              <div style={styles.cardLabel}>Course Fees</div>
              <p style={styles.cardValue}>₹{applicationData.courseFees?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseStatusCheck;