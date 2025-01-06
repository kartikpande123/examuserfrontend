import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "./ApiConifg";

const ExamEntry = () => {
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState(null);
  const [timeUntilExam, setTimeUntilExam] = useState(null);
  const [canStart, setCanStart] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [registeredInfo, setRegisteredInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let eventSource;
    let timer;

    const connectToSSE = () => {
      eventSource = new EventSource(`${API_BASE_URL}/api/exams`);

      eventSource.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.success) {
            const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            const currentTime = new Date(now);
            
            const upcomingExams = response.data.filter(exam => {
              const examDate = new Date(exam.date);
              const examDateTime = new Date(`${exam.date} ${exam.startTime}`);
              const endDateTime = new Date(`${exam.date} ${exam.endTime}`);
              
              return (examDate.toDateString() === currentTime.toDateString() && endDateTime > currentTime) || 
                     examDateTime > currentTime;
            });

            const sortedExams = upcomingExams.sort((a, b) => {
              const dateTimeA = new Date(`${a.date} ${a.startTime}`);
              const dateTimeB = new Date(`${b.date} ${b.startTime}`);
              return dateTimeA - dateTimeB;
            });

            const nextExam = sortedExams[0];
            if (nextExam) {
              setExamData(nextExam);
            } else {
              setError('No upcoming exams scheduled');
            }
          }
        } catch (err) {
          console.error('Error processing SSE data:', err);
          setError('Failed to load exam data');
        }
      };

      eventSource.onerror = () => {
        console.error('SSE Connection lost');
        eventSource.close();
        setTimeout(connectToSSE, 5000);
      };
    };

    const updateExamTimer = () => {
      if (examData) {
        const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const currentTime = new Date(now);
        const examDateTime = new Date(`${examData.date} ${examData.startTime}`);
        const endDateTime = new Date(`${examData.date} ${examData.endTime}`);
        
        if (currentTime > endDateTime) {
          setExamData(null);
          setError('Exam has ended');
          return;
        }

        const timeDiff = examDateTime - currentTime;
        const minutesUntilExam = Math.floor(timeDiff / (1000 * 60));

        setTimeUntilExam(minutesUntilExam);
        setCanStart(minutesUntilExam <= 15 && minutesUntilExam >= 0);

        // If registered and exam starts, start exam and redirect
        if (registeredInfo && minutesUntilExam <= 0) {
          handleExamStart();
        }

        // Update countdown for registered users
        if (registeredInfo && minutesUntilExam > 0) {
          const seconds = Math.floor((timeDiff / 1000) % 60);
          const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }

        if (minutesUntilExam < -examData.duration) {
          setRegNumber('');
          setError('Exam has ended');
        }
      }
    };

    connectToSSE();
    timer = setInterval(updateExamTimer, 1000);
    updateExamTimer();

    return () => {
      if (eventSource) eventSource.close();
      if (timer) clearInterval(timer);
    };
  }, [examData, registeredInfo]);

  const handleExamStart = async () => {
    try {
      const startResponse = await fetch(`${API_BASE_URL}/api/start-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: registeredInfo.regNumber,
        }),
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start exam');
      }

      navigate('/exam', {
        state: {
          candidateId: registeredInfo.regNumber,
          examName: registeredInfo.examName,
          candidateName: registeredInfo.candidateName,
          district: registeredInfo.district,
          examDate: registeredInfo.examDate,
          examStartTime: registeredInfo.examStartTime,
          examEndTime: registeredInfo.examEndTime,
        },
      });
    } catch (err) {
      console.error('Error starting exam:', err);
      setError('Failed to start exam. Please try again.');
      setRegisteredInfo(null);
    }
  };

  const validateAndStartExam = async () => {
    if (!canStart) {
      setError('Registration is not open yet');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const validateResponse = await fetch(`${API_BASE_URL}/api/validate-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: regNumber,
        }),
      });

      const validationData = await validateResponse.json();

      if (!validateResponse.ok) {
        setError(validationData.error || 'Invalid registration number');
        return;
      }

      if (validationData.used) {
        setError('This registration number has already been used for the exam');
        return;
      }

      // Store all the candidate information
      setRegisteredInfo({
        regNumber: regNumber,
        examName: validationData.examName,
        candidateName: validationData.candidateName,
        district: validationData.district,
        examDate: validationData.examDate,
        examStartTime: validationData.examStartTime,
        examEndTime: validationData.examEndTime
      });

      // If exam has already started, proceed immediately
      if (timeUntilExam <= 0) {
        await handleExamStart();
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to verify registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!examData) return 'Loading exam information...';
    
    if (registeredInfo) {
      return `Registration confirmed for ${registeredInfo.candidateName}! Exam starts in ${countdown}`;
    }
    
    if (timeUntilExam < 0) return 'Exam has already started';
    if (timeUntilExam <= 15 && timeUntilExam > 0) return `Registration is open! Exam starts in ${timeUntilExam} minutes`;  
    if (timeUntilExam > 15) {
      const hours = Math.floor(timeUntilExam / 60);
      const minutes = timeUntilExam % 60;
      return `Registration will open in ${hours > 0 ? `${hours} hours and ` : ''}${minutes} minutes`;
    }
    return '';
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Exam Entry</h4>
            </div>
            <div className="card-body">
              {examData && (
                <div className="alert alert-info mb-3 text-center">
                  <h5 className="mb-2">{`Exam ${examData.id}`}</h5>
                  <p className="mb-1">
                    Date: {new Date(examData.date).toLocaleDateString()}<br />
                    Time: {examData.startTime} - {examData.endTime}
                  </p>
                  <p className="mb-0 mt-2 fw-bold">{getStatusMessage()}</p>
                </div>
              )}

              {timeUntilExam >= 0 && (
                <>
                  <div className="mb-3">
                    <label htmlFor="regNumber" className="form-label">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="regNumber"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value.trim())}
                      placeholder="Enter registration number"
                      disabled={!canStart || registeredInfo}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {!registeredInfo && (
                    <button
                      className="btn btn-primary w-100"
                      onClick={validateAndStartExam}
                      disabled={loading || !regNumber || !canStart}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Verifying...
                        </span>
                      ) : (
                        'Start Exam'
                      )}
                    </button>
                  )}

                  {registeredInfo && (
                    <div className="alert alert-success text-center">
                      <p className="fw-bold mb-0">Registration confirmed for {registeredInfo.candidateName}</p>
                      <p className="mb-2">District: {registeredInfo.district}</p>
                      <p className="mb-0">You will automatically enter the exam when it begins</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEntry;