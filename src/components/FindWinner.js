import React, { useState } from 'react';
import API_BASE_URL from "./ApiConfig";

const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 2000,
      animation: 'slideIn 0.5s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      maxWidth: '400px',
    };

    const types = {
      success: {
        backgroundColor: '#10B981',
        color: 'white',
      },
      error: {
        backgroundColor: '#EF4444',
        color: 'white',
      },
    };

    return { ...baseStyles, ...types[type] };
  };

  return (
    <div style={getToastStyles()}>
      {type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
      )}
      <span style={{ fontWeight: '500' }}>{message}</span>
    </div>
  );
};

const FindWinner = () => {
  const [registrationNo, setRegistrationNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState('');
  const [savingChoice, setSavingChoice] = useState(false);
  const [toast, setToast] = useState(null);

  const modalStyles = {
    modal: {
      display: showModal ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    },
    modalContent: {
      position: 'relative',
      top: '50%',
      transform: 'translateY(-50%)',
      margin: '0 auto',
      maxWidth: '600px',
      minHeight: '400px',
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '20px 30px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    },
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const getPrizeAmount = (rank) => {
    const prizes = {
      1: '1000₹',
      2: '750₹',
      3: '500₹'
    };
    return prizes[rank] || '0₹';
  };

  const getTopThreeByExam = (results) => {
    const examWiseResults = {};
    
    results.forEach(exam => {
      examWiseResults[exam.examId] = exam.candidates
        .filter(candidate => candidate.correctAnswers > 0)
        .sort((a, b) => {
          if (b.correctAnswers === a.correctAnswers) {
            return a.timestamp.localeCompare(b.timestamp);
          }
          return b.correctAnswers - a.correctAnswers;
        })
        .slice(0, 3);
    });
    
    return examWiseResults;
  };

  const findUserRank = (topThree, regNo) => {
    for (const examId in topThree) {
      const rankIndex = topThree[examId].findIndex(
        candidate => candidate.registrationNumber === regNo
      );
      if (rankIndex !== -1) {
        return {
          rank: rankIndex + 1,
          examTitle: examId,
          candidateData: topThree[examId][rankIndex]
        };
      }
    }
    return null;
  };

  const handleSearch = async () => {
    if (!registrationNo.trim()) {
      setError('Please enter a registration number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/all-exam-results`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      const topThreeByExam = getTopThreeByExam(data.data);
      const userRankInfo = findUserRank(topThreeByExam, registrationNo);
      setResultData(userRankInfo);
      setShowModal(true);

    } catch (error) {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChoice = async (selectedOption) => {
    if (!resultData) return;

    setSavingChoice(true);
    try {
      const today = new Date();
      const dateString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

      const response = await fetch(`${API_BASE_URL}/api/save-winner-choice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examTitle: resultData.examTitle,
          registrationNumber: registrationNo,
          rank: resultData.rank,
          selectedOption: selectedOption,
          dateCreated: dateString
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save choice');
      }

      setShowModal(false);
      showToast('Thank you! We will contact you within 2 days.', 'success');

    } catch (error) {
      if (error.message.includes('already recorded')) {
        showToast('You have already made your choice for this prize. Please contact support if you need to make changes.', 'error');
      } else {
        showToast('Failed to save your choice. Please try again.', 'error');
      }
    } finally {
      setSavingChoice(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e9ecff 100%)',
      padding: '2rem',
    }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg" style={{
              borderRadius: '20px',
              border: 'none',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}>
              <div className="card-body p-5">
                <h2 className="text-center mb-4" style={{
                  color: '#4338ca',
                  fontWeight: '800',
                  fontSize: '2.2rem',
                  textShadow: '0 2px 4px rgba(67, 56, 202, 0.1)',
                }}>
                  🏆 Prize Winner Search
                </h2>

                <div className="mb-4 position-relative">
                  <input
                    type="text"
                    className="form-control form-control-lg shadow-sm"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    placeholder="Enter Registration Number"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center p-3 rounded-3" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-circle me-2" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-primary w-100"
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    backgroundColor: '#4338ca',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(67, 56, 202, 0.2)',
                  }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {loading ? 'Searching...' : 'Check Your Prize'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Result Modal */}
       <div style={modalStyles.modal}>
        <div style={modalStyles.modalContent}>
          {resultData ? (
            <div className="text-center">
              <div className="mb-3">
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#d97706" className="bi bi-trophy" viewBox="0 0 16 16">
                    <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-primary mb-3" style={{ 
                color: '#4338ca',
                fontSize: '1.8rem',
                fontWeight: '800'
              }}>
                Congratulations!
              </h3>
              <div className="bg-light p-3 rounded-3 mb-3" style={{
                backgroundColor: '#f8fafc'
              }}>
                <p className="fs-5 mb-2">
                  You have secured <span className="fw-bold" style={{ color: '#4338ca' }}>Rank {resultData.rank}</span>
                </p>
                <p className="fs-5 mb-0">
                  Equivalent Prize Amount: <span className="fw-bold text-success">{getPrizeAmount(resultData.rank)}</span>
                </p>
              </div>
              
              <a 
                href="https://drive.google.com/file/d/1RgPxDZ_SHcr8-JX8ZWJ6X498r9egAfVU/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary d-block mb-3 w-100"
                style={{
                  borderRadius: '10px',
                  padding: '0.75rem',
                  borderWidth: '2px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download me-2" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                View Prize Details
              </a>

              <div className="d-grid gap-2">
                <button 
                  onClick={() => handleSaveChoice('product')}
                  disabled={savingChoice}
                  className="btn btn-success"
                  style={{
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  {savingChoice ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Get Equivalent Product'}
                </button>
                <button 
                  onClick={() => handleSaveChoice('cash')}
                  disabled={savingChoice}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '10px',
                    padding: '0.75rem',
                    backgroundColor: '#2563eb',
                    fontWeight: '600'
                  }}
                >
                  {savingChoice ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Get Cash Prize'}
                </button>
              </div>
            </div>
          ) :(
            <div className="text-center">
              <div className="mb-3">
                <div style={{
                  backgroundColor: '#fee2e2',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#dc2626" className="bi bi-x-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </div>
              </div>
              <h4 className="text-secondary mb-3 fw-bold">Not in Top 3</h4>
              <p className="text-muted">Sorry, you are not among the top 3 rank holders.</p>
            </div>
          )}
          
          <button
            onClick={() => setShowModal(false)}
            className="btn btn-secondary w-100 mt-3"
            style={{
              borderRadius: '10px',
              padding: '0.75rem',
              backgroundColor: '#6b7280',
              border: 'none'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindWinner;