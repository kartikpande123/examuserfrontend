import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import "./MainExam.css"
import API_BASE_URL from "./ApiConifg"


const MainExam = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examEndTime, setExamEndTime] = useState(null);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { candidateId, examName } = state;

  const styles = {
    examContainer: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '20px 0'
    },
    examCard: {
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: '15px',
      border: 'none',
      maxWidth: '900px',
      margin: '0 auto'
    },
    examHeader: {
      backgroundColor: '#2c3e50',
      color: 'white',
      borderTopLeftRadius: '15px',
      borderTopRightRadius: '15px',
      padding: '20px'
    },
    questionNumber: {
      backgroundColor: '#34495e',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '20px',
      display: 'inline-block',
      margin: '10px 0'
    },
    optionsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
      padding: '20px'
    },
    optionBox: {
      border: '1px solid #dee2e6',
      borderRadius: '10px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'white'
    },
    selectedOption: {
      backgroundColor: '#3498db',
      color: 'white',
      border: '1px solid #3498db'
    },
    imageContainer: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    questionImage: {
      maxWidth: '400px',
      height: 'auto',
      borderRadius: '10px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    },
    navigationButton: {
      borderRadius: '25px',
      padding: '8px 20px',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    timer: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '20px',
      fontSize: '1.1rem',
      fontWeight: 'bold'
    }
  };

  // Load saved answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam_${examName}_${candidateId}`);
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
    
    const savedSkipped = localStorage.getItem(`skipped_${examName}_${candidateId}`);
    if (savedSkipped) {
      setSkippedQuestions(JSON.parse(savedSkipped));
    }
  }, [examName, candidateId]);

  // Save to localStorage when answers change
  useEffect(() => {
    localStorage.setItem(`exam_${examName}_${candidateId}`, JSON.stringify(selectedAnswers));
  }, [selectedAnswers, examName, candidateId]);

  // Save skipped questions to localStorage
  useEffect(() => {
    localStorage.setItem(`skipped_${examName}_${candidateId}`, JSON.stringify(skippedQuestions));
  }, [skippedQuestions, examName, candidateId]);
  useEffect(() => {
    let timerInterval;
    const source = new EventSource(`${API_BASE_URL}/api/today-exams`);

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success && data.data.length > 0) {
        const currentExam = data.data.find(exam => exam.date === moment().format('YYYY-MM-DD'));
        if (currentExam) {
          const endTime = moment(currentExam.endTime, 'hh:mm A');
          setExamEndTime(endTime);
          
          timerInterval = setInterval(() => {
            const now = moment();
            const duration = moment.duration(endTime.diff(now));
            
            if (duration.asSeconds() <= 0) {
              clearInterval(timerInterval);
              handleExamTimeout();
            } else {
              setTimeRemaining({
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds()
              });
            }
          }, 1000);
        }
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    const fetchTodaysExam = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/api/exam-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: today,
            examName
          })
        });

        const data = await response.json();

        if (data.success && data.data.questions) {
          setQuestions(data.data.questions);
        } else {
          throw new Error('No exam scheduled for today');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setLoading(false);
      }
    };

    fetchTodaysExam();
  }, [examName]);

  const handleExamTimeout = async () => {
    try {
      const answersToSubmit = Object.entries(selectedAnswers).map(([questionId, answer], index) => ({
        registrationNumber: candidateId,
        questionId: questionId.startsWith('Q') ? questionId : `Q${questionId}`,
        answer,
        examName,
        order: index + 1,
        skipped: skippedQuestions.includes(questionId)
      }));

      const response = await fetch(`${API_BASE_URL}/api/timeout-save-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersToSubmit })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save answers');
      }

      localStorage.removeItem(`exam_${examName}_${candidateId}`);
      localStorage.removeItem(`skipped_${examName}_${candidateId}`);

      // alert(`Exam time is over! You attempted questions will stored....`);
      setShowCompletionModal(true);
      
      setTimeout(() => {
        navigate('/', {
          state: {
            candidateId,
            examName,
            answeredQuestions: Object.keys(selectedAnswers).length,
            skippedQuestions: skippedQuestions.length,
            totalQuestions: questions.length,
            timeoutSubmission: true
          }
        });
      }, 3000);
    } catch (error) {
      console.error('Error saving timeout answers:', error);
      // alert(`Error saving answers: ${error.message}. Please contact support.`);
    }
  };

  const handleAnswerSelection = async (questionId, answer) => {
    try {
      const newAnswers = {
        ...selectedAnswers,
        [questionId]: answer
      };
      setSelectedAnswers(newAnswers);
      setSkippedQuestions(prev => prev.filter(id => id !== questionId));

      const response = await fetch(`${API_BASE_URL}/api/save-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: candidateId,
          questionId: questionId.startsWith('Q') ? questionId : `Q${questionId}`,
          answer,
          examName,
          order: currentQuestionIndex + 1,
          skipped: false
        })
      });

      if (!response.ok) {
        console.error('Failed to save answer to backend');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSkipQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setSkippedQuestions(prev => [...prev, currentQuestion.id]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!selectedAnswers[currentQuestion.id] && !skippedQuestions.includes(currentQuestion.id)) {
      alert('Please select an answer or skip the question');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleExamCompletion();
    }
  };

  const handleExamCompletion = () => {
    setShowCompletionModal(true);
    setTimeout(() => {
      navigate('/', { 
        state: { 
          candidateId,
          examName,
          answeredQuestions: Object.keys(selectedAnswers).length,
          skippedQuestions: skippedQuestions.length,
          totalQuestions: questions.length
        }
      });
    }, 3000);
  };
  if (loading) {
    return (
      <div style={styles.examContainer}>
        <div className="container">
          <div className="card" style={styles.examCard}>
            <div className="card-body text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your exam...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={styles.examContainer}>
      <Modal show={showCompletionModal} centered backdrop="static" keyboard={false}>
        <div className="text-center p-4">
          <i className="fas fa-check-circle text-success mb-3" style={{fontSize: '3rem'}}></i>
          <h4 className="mb-3">Exam Completed!</h4>
          <p className="text-muted mb-4">Redirecting to dashboard in 3 seconds...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Modal>

      <div className="container">
        <div className="card" style={styles.examCard}>
          <div style={styles.examHeader}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0">{examName}</h2>
              {timeRemaining && (
                <div style={styles.timer}>
                  Time Remaining: {String(timeRemaining.hours).padStart(2, '0')}:
                  {String(timeRemaining.minutes).padStart(2, '0')}:
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </div>
              )}
            </div>
            <div className="text-center">
              <span style={styles.questionNumber}>
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>

          <div className="card-body p-4">
            <h4 className="mb-4">{currentQuestion.question}</h4>

            {currentQuestion.image && (
              <div style={styles.imageContainer}>
                <img
                  src={currentQuestion.image}
                  alt="Question illustration"
                  style={styles.questionImage}
                  className="hover-zoom"
                />
              </div>
            )}

            <div style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.optionBox,
                    ...(selectedAnswers[currentQuestion.id] === index.toString() ? styles.selectedOption : {})
                  }}
                  onClick={() => !loading && handleAnswerSelection(currentQuestion.id, index.toString())}
                  className="option-box"
                >
                  <label className="d-block mb-0" style={{cursor: 'pointer'}}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={index.toString()}
                      checked={selectedAnswers[currentQuestion.id] === index.toString()}
                      onChange={() => {}}
                      className="d-none"
                    />
                    <span className="fw-bold me-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-primary"
                style={styles.navigationButton}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <i className="fas fa-chevron-left me-2"></i>
                Previous
              </button>

              <div>
              <button
                  className="btn btn-warning me-2"
                  style={styles.navigationButton}
                  onClick={handleSkipQuestion}
                >
                  <i className="fas fa-forward me-2"></i>
                  Skip
                </button>

                <button
                  className="btn btn-success"
                  style={styles.navigationButton}
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswers[currentQuestion.id] && !skippedQuestions.includes(currentQuestion.id)}
                >
                  {currentQuestionIndex === questions.length - 1 ? (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Finish
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
      </div>
    </div>
  );
};

export default MainExam;