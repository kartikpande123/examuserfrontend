import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import "./PracticeMainExam.css";
import API_BASE_URL from './ApiConfig';

const PracticeMainExam = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [examDetails, setExamDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [submittingResults, setSubmittingResults] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
        try {
            // Get exam info from localStorage using the correct key
            const examInfoString = localStorage.getItem('practiceExamSession');
            console.log('Raw localStorage data:', examInfoString);

            if (!examInfoString) {
                throw new Error('No exam information found in localStorage');
            }

            // Parse the JSON data
            const examInfo = JSON.parse(examInfoString);
            console.log('Parsed examInfo:', examInfo);

            // Set up timer based on timeLimit
            if (examInfo.examDetails.timeLimit && examInfo.examDetails.timeLimit !== 'N/A') {
                const [hours, minutes] = examInfo.examDetails.timeLimit.split(':').map(Number);
                const totalSeconds = (hours * 60 * 60) + (minutes * 60);
                setTimeRemaining(totalSeconds);
            } else {
                setTimeRemaining(null);
            }

            // Use the new API endpoint with /api/practice
            const response = await axios.get(
              `${API_BASE_URL}/api/practice/${encodeURIComponent(examInfo.examDetails.category)}/${encodeURIComponent(examInfo.examDetails.title)}/questions`
            );

            // Adjust to match the new API response structure
            if (response.data && response.data.questions) {
                setQuestions(response.data.questions);
                // Set basic exam details from localStorage since the new API doesn't return them
                setExamDetails({
                    title: examInfo.examDetails.title,
                    category: examInfo.examDetails.category,
                    timeLimit: examInfo.examDetails.timeLimit || 'N/A',
                    purchaseDate: examInfo.examDetails.purchaseDate || null
                });
            } else {
                throw new Error('Failed to fetch exam questions');
            }
        } catch (err) {
            console.error('Error fetching exam data:', err);
            setError(err.message || 'Error loading exam');
        } finally {
            setLoading(false);
        }
    };
    
    fetchExamData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer effect
  useEffect(() => {
    let timerId;
    
    if (timeRemaining !== null && timeRemaining > 0 && !timeExpired) {
      timerId = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            setTimeExpired(true);
            calculateResults(); // Auto-submit when time expires
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeRemaining, timeExpired]);

  // Format time for display
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return "N/A";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const styles = {
    examContainer: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    examCard: {
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: '15px',
      border: 'none',
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      overflow: 'hidden'
    },
    examHeader: {
      backgroundColor: '#2c3e50',
      color: 'white',
      borderTopLeftRadius: '15px',
      borderTopRightRadius: '15px',
      padding: '15px'
    },
    questionNumber: {
      backgroundColor: '#34495e',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '20px',
      display: 'inline-block',
      margin: '10px 0',
      fontSize: '0.9rem'
    },
    timerContainer: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      margin: '10px 0',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    },
    timerIcon: {
      marginRight: '5px'
    },
    optionsContainer: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '15px',
      padding: '15px'
    },
    optionBox: {
      border: '1px solid #dee2e6',
      borderRadius: '10px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    selectedOption: {
      backgroundColor: '#3498db',
      color: 'white',
      border: '1px solid #3498db',
      boxShadow: '0 2px 8px rgba(52, 152, 219, 0.4)'
    },
    correctOption: {
      backgroundColor: '#2ecc71',
      color: 'white',
      border: '1px solid #2ecc71',
      boxShadow: '0 2px 8px rgba(46, 204, 113, 0.4)'
    },
    incorrectOption: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: '1px solid #e74c3c',
      boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)'
    },
    navigationButton: {
      borderRadius: '25px',
      padding: '10px 25px',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: '20px'
    },
    progressBar: {
      height: '8px',
      borderRadius: '4px',
      backgroundColor: '#e9ecef',
      overflow: 'hidden',
      marginBottom: '20px'
    },
    progressFill: (progress) => ({
      height: '100%',
      width: `${progress}%`,
      backgroundColor: progress < 30 ? '#e74c3c' : progress < 70 ? '#f39c12' : '#2ecc71',
      transition: 'width 0.3s ease'
    }),
    resultsCardContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '15px',
      marginBottom: '20px'
    },
    resultsCard: {
      padding: '20px',
      borderRadius: '10px',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      flex: isMobile ? '1' : '1 0 48%'
    },
    modalButton: {
      borderRadius: '25px',
      padding: '10px 20px',
      margin: '7 5px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    toastContainer: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999
    },
    feedbackMessage: {
      padding: '10px',
      borderRadius: '8px',
      marginTop: '15px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    // New style for context container
    contextContainer: {
      padding: '15px',
      marginTop: '15px',
      backgroundColor: '#f0f9ff',
      borderLeft: '4px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    contextTitle: {
      color: '#1e40af',
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '1rem'
    },
    contextText: {
      color: '#374151',
      lineHeight: '1.5',
      fontSize: '0.95rem',
      marginBottom: '0'
    }
  };

  const handleAnswerSelection = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Show feedback after selection
    setShowAnswerFeedback(true);
    
    // Removed auto-proceed to next question
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];

    if (!selectedAnswers[currentQuestion.id]) {
      // Show toast instead of alert
      setToastMessage('Please select an answer before proceeding');
      setShowToast(true);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setShowAnswerFeedback(false);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // This is the last question, calculate the results
      calculateResults();
    }
  };

  const calculateResults = () => {
    setSubmittingResults(true);
    
    const totalQuestions = questions.length;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let answeredQuestions = 0;
    
    questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer !== undefined) {
        answeredQuestions++;
        if (parseInt(selectedAnswer) === question.correctAnswer) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
      }
    });
    
    const score = (correctAnswers / totalQuestions) * 100;
    
    setExamResult({
      score: score.toFixed(2),
      correctAnswers,
      totalQuestions,
      incorrectAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions
    });
    
    // Simulate a brief loading period for visual feedback
    setTimeout(() => {
      setSubmittingResults(false);
      setShowResultModal(true);
    }, 800);
  };

  const handleStartAgain = () => {
    // Reset the exam state
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResultModal(false);
    setExamResult(null);
    setTimeExpired(false);
    setShowAnswerFeedback(false);
    
    // Reset the timer if there was a time limit
    if (examDetails.timeLimit && examDetails.timeLimit !== 'N/A') {
      const [hours, minutes] = examDetails.timeLimit.split(':').map(Number);
      const totalSeconds = (hours * 60 * 60) + (minutes * 60);
      setTimeRemaining(totalSeconds);
    } else {
      setTimeRemaining(null);
    }
  };

  // Determine option style based on selection and feedback state
  const getOptionStyle = (optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestion.id];
    
    if (!showAnswerFeedback) {
      return selectedAnswer === optionIndex.toString() ? styles.selectedOption : {};
    }
    
    if (optionIndex === currentQuestion.correctAnswer) {
      return styles.correctOption;
    }
    
    if (selectedAnswer === optionIndex.toString() && optionIndex !== currentQuestion.correctAnswer) {
      return styles.incorrectOption;
    }
    
    return {};
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3 text-center fs-5">Loading practice exam questions...</p>
        <div className="progress w-50" style={{ height: '8px' }}>
          <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-danger shadow-sm">
          <h4 className="alert-heading">Error Loading Exam</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-primary btn-lg px-4" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left me-2"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-warning shadow-sm">
          <h4 className="alert-heading">No Questions Available</h4>
          <p>There are no questions available for this exam.</p>
          <hr />
          <button className="btn btn-primary btn-lg px-4" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left me-2"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;
  const isAnswerCorrect = selectedAnswers[currentQuestion.id] !== undefined && 
                          parseInt(selectedAnswers[currentQuestion.id]) === currentQuestion.correctAnswer;

  return (
    <div style={styles.examContainer}>
      <div className="container">
        <div className="card" style={styles.examCard}>
          <div style={styles.examHeader}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="mb-0 fs-4 fw-bold">{examDetails.title || 'Practice Exam'}</h2>
              <span className="badge bg-light text-dark">
                {examDetails.category || 'General'}
              </span>
            </div>
            
            <div style={styles.progressBar}>
              <div style={styles.progressFill(progressPercentage)}></div>
            </div>
            
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <span style={styles.questionNumber}>
                <i className="fas fa-question-circle me-1"></i>
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
              <span style={styles.timerContainer}>
                <i className="fas fa-clock" style={styles.timerIcon}></i>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          <div className="card-body p-4">
            <h4 className="mb-4 question-text">{currentQuestion.question}</h4>

            {currentQuestion.imageUrl && (
              <div className="image-container mb-4 text-center">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question illustration"
                  className="question-image img-fluid rounded shadow-sm"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}

            <div style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.optionBox,
                    ...getOptionStyle(index)
                  }}
                  onClick={() => !showAnswerFeedback && handleAnswerSelection(currentQuestion.id, index.toString())}
                  className="option-box"
                >
                  <label className="d-block mb-0" style={{cursor: !showAnswerFeedback ? 'pointer' : 'default'}}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={index.toString()}
                      checked={selectedAnswers[currentQuestion.id] === index.toString()}
                      onChange={() => {}}
                      className="d-none"
                      disabled={showAnswerFeedback}
                    />
                    <span className="fw-bold me-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </label>
                </div>
              ))}
            </div>

            {showAnswerFeedback && (
              <div>
                {/* Feedback Message */}
                <div 
                  style={{
                    ...styles.feedbackMessage,
                    backgroundColor: isAnswerCorrect ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: isAnswerCorrect ? '#2ecc71' : '#e74c3c',
                    border: `1px solid ${isAnswerCorrect ? '#2ecc71' : '#e74c3c'}`
                  }}
                >
                  {isAnswerCorrect ? (
                    <><i className="fas fa-check-circle me-2"></i>Correct! Well done!</>
                  ) : (
                    <><i className="fas fa-times-circle me-2"></i>Incorrect! The correct answer is {String.fromCharCode(65 + currentQuestion.correctAnswer)}.</>
                  )}
                </div>

                {/* Correct Answer Context (only show if exists) */}
                {currentQuestion.correctAnswerContext && (
                  <div style={styles.contextContainer}>
                    <div style={styles.contextTitle}>
                      <i className="fas fa-lightbulb me-2"></i>
                      Explanation
                    </div>
                    <p style={styles.contextText}>
                      {currentQuestion.correctAnswerContext}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="d-flex justify-content-end align-items-center mt-4">
              <button
                className="btn btn-success"
                style={styles.navigationButton}
                onClick={handleNextQuestion}
                disabled={submittingResults}
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <i className="fas fa-check me-2"></i>
                    {submittingResults ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Calculating...
                      </>
                    ) : (
                      'Finish'
                    )}
                  </>
                ) : (
                  <>
                    Next
                    <i className="fas fa-chevron-right ms-2"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={styles.toastContainer}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg="warning"
        >
          <Toast.Header closeButton>
            <i className="fas fa-exclamation-circle me-2"></i>
            <strong className="me-auto">Attention</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Results Modal */}
      <Modal 
        show={showResultModal} 
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        centered
        size="lg"
        className="results-modal"
      >
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>{timeExpired ? 'Time Expired - Exam Results' : 'Practice Exam Results'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {examResult && (
            <div className="text-center">
              <div className="score-circle mb-4 mx-auto" style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.7rem',
                fontWeight: 'bold',
                color: 'white',
                background: `conic-gradient(
                  ${examResult.score >= 70 ? '#2ecc71' : examResult.score >= 50 ? '#f39c12' : '#e74c3c'} 
                  ${examResult.score}%, 
                  #ecf0f1 0%
                )`
              }}>
                <div style={{
                  backgroundColor: 'white',
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{
                    color: examResult.score >= 70 ? '#2ecc71' : examResult.score >= 50 ? '#f39c12' : '#e74c3c'
                  }}>{examResult.score}%</span>
                  <span style={{fontSize: '0.8rem', color: '#7f8c8d'}}>Score</span>
                </div>
              </div>

              <div style={styles.resultsCardContainer}>
                <div style={{
                  ...styles.resultsCard,
                  backgroundColor: '#2ecc71'
                }}>
                  <i className="fas fa-check-circle fa-2x mb-2"></i>
                  <h3 className="mb-0">{examResult.correctAnswers}</h3>
                  <p className="mb-0">Correct Answers</p>
                </div>
                <div style={{
                  ...styles.resultsCard,
                  backgroundColor: '#e74c3c'
                }}>
                  <i className="fas fa-times-circle fa-2x mb-2"></i>
                  <h3 className="mb-0">{examResult.incorrectAnswers}</h3>
                  <p className="mb-0">Incorrect Answers</p>
                </div>
              </div>

              <div className="result-details p-3 bg-light rounded mt-4">
                <p className="mb-1"><strong>Total Questions:</strong> {examResult.totalQuestions}</p>
                <p className="mb-1"><strong>Time Used:</strong> {examDetails.timeLimit && examDetails.timeLimit !== 'N/A' ? formatTime(timeExpired ? 0 : timeRemaining) : 'N/A'}</p>
                
                <div className="alert alert-success mt-3">
                  <i className="fas fa-check-circle me-2"></i>
                  Practice exam completed!
                </div>
                
                {examResult.unansweredQuestions > 0 && (
                  <div className="alert alert-warning mt-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Unanswered Questions: {examResult.unansweredQuestions}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <button 
            className="btn btn-success" 
            style={styles.modalButton}
            onClick={handleStartAgain}
          >
            <i className="fas fa-redo me-2"></i>
            Start Again
          </button>
          <button 
            className="btn btn-primary" 
            style={styles.modalButton}
            onClick={() => window.location.href = '/'}
          >
            <i className="fas fa-home me-2"></i>
            Return to Dashboard
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PracticeMainExam;