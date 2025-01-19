import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import API_BASE_URL from "./ApiConifg";

const CandidateAnswerViewer = () => {
  const [registrationId, setRegistrationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateData, setCandidateData] = useState(null);
  const [examData, setExamData] = useState(null);

  const isExamCompleted = (examDateTime) => {
    if (!examDateTime) return false;

    const currentDate = new Date();
    const examDate = new Date(examDateTime.date);
    
    // Parse exam end time
    const [endTimeStr, period] = examDateTime.endTime.split(' ');
    let [hours, minutes] = endTimeStr.split(':');
    hours = parseInt(hours);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Set the exam end time
    examDate.setHours(hours, parseInt(minutes), 0);
    
    return currentDate > examDate;
  };

  const fetchCandidateAnswers = async () => {
    setLoading(true);
    setError('');
    try {
      // First fetch exam details to check if exam is completed
      const examResponse = await fetch(`${API_BASE_URL}/api/exams/qa`);
      const examData = await examResponse.json();
      
      if (!examData.success) {
        setError('Failed to fetch exam details');
        return;
      }

      // Find the relevant exam
      const candidateResponse = await fetch(`${API_BASE_URL}/api/candidate-answers/${registrationId}`);
      const candidateData = await candidateResponse.json();
      
      if (!candidateData.success) {
        setError(candidateData.message || 'Failed to fetch candidate answers');
        setCandidateData(null);
        return;
      }

      const matchedExam = examData.data.find(exam => exam.id === candidateData.data.candidateDetails.exam);
      
      if (!matchedExam) {
        setError('Exam details not found');
        return;
      }

      // Check if exam is completed
      if (!isExamCompleted(matchedExam.dateTime)) {
        setError('Your exam is not completed yet. Answers will be available after the exam end time.');
        setCandidateData(null);
        setExamData(null);
        return;
      }

      setCandidateData(candidateData.data);
      setExamData(matchedExam);
      
    } catch (err) {
      setError('Error fetching data');
      setCandidateData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, candidateAnswer) => {
    const isSkipped = !candidateAnswer || candidateAnswer.skipped;
    const userAnswer = isSkipped ? 'Skipped' : candidateAnswer.answer;
    const isCorrect = !isSkipped && userAnswer === question.correctAnswer;

    return (
      <div key={question.id} className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-primary bg-gradient text-white py-3">
          <h5 className="card-title mb-0">Question {question.order}</h5>
        </div>
        <div className="card-body p-4">
          <p className="question-text fs-5 mb-4">{question.question}</p>
          
          <div className="options-container mb-4">
            {question.options.map((option, index) => {
              const isUserAnswer = userAnswer === index;
              const isCorrectAnswer = question.correctAnswer === index;
              
              let bgClass = 'bg-light';
              if (isUserAnswer && isCorrect) bgClass = 'bg-success bg-opacity-10';
              else if (isUserAnswer && !isCorrect) bgClass = 'bg-danger bg-opacity-10';
              else if (isCorrectAnswer) bgClass = 'bg-success bg-opacity-10';

              return (
                <div
                  key={index}
                  className={`option-item p-3 mb-2 rounded-3 ${bgClass}`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span className="option-number fw-bold text-primary">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="option-text">{option}</span>
                    </div>
                    <div className="d-flex gap-2">
                      {isUserAnswer && (
                        <span className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                          Your Answer
                        </span>
                      )}
                      {isCorrectAnswer && (
                        <span className="badge bg-success">Correct Answer</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="answer-summary mt-4 pt-3 border-top">
            <div className="row align-items-center">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-secondary">Your Answer:</span>
                  {isSkipped ? (
                    <span className="text-warning d-flex align-items-center gap-1">
                      <AlertCircle size={16} />
                      Skipped
                    </span>
                  ) : (
                    <span 
                      className={`d-flex align-items-center gap-1 ${isCorrect ? 'text-success' : 'text-danger'}`}
                    >
                      {isCorrect ? 
                        <CheckCircle size={16} /> : 
                        <XCircle size={16} />
                      }
                      Option {String.fromCharCode(65 + userAnswer)}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-secondary">Correct Answer:</span>
                  <span className="text-success">
                    Option {String.fromCharCode(65 + question.correctAnswer)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCandidateInfo = () => {
    if (!candidateData || !examData) return null;

    return (
      <div>
        <div className="candidate-info card bg-light border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="text-primary mb-4">Candidate Details</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <div className="info-item">
                  <label className="text-muted mb-1">Name</label>
                  <p className="fs-5 mb-0">{candidateData.candidateDetails.name}</p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="info-item">
                  <label className="text-muted mb-1">Exam ID</label>
                  <p className="fs-5 mb-0">{candidateData.candidateDetails.exam}</p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="info-item">
                  <label className="text-muted mb-1">Date</label>
                  <p className="fs-5 mb-0">
                    {new Date(candidateData.candidateDetails.examDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="info-item">
                  <label className="text-muted mb-1">Exam Time</label>
                  <p className="fs-5 mb-0">
                    {examData.dateTime.startTime} - {examData.dateTime.endTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="questions-container">
          {examData.questions
            .sort((a, b) => a.order - b.order)
            .map(question => {
              const candidateAnswer = candidateData.answers.find(
                ans => ans.order === question.order
              );
              return renderQuestion(question, candidateAnswer);
            })}
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow border-0">
            <div className="card-header bg-primary bg-gradient text-white py-3">
              <div className="d-flex align-items-center justify-content-between">
                <h4 className="card-title mb-0">Exam Answer Viewer</h4>
                {loading && (
                  <div className="spinner-grow spinner-grow-sm text-white" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body p-4">
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-8">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="registrationId"
                      className="form-control form-control-lg"
                      placeholder="Enter Registration ID"
                      value={registrationId}
                      onChange={(e) => setRegistrationId(e.target.value)}
                    />
                    <label htmlFor="registrationId">Registration ID</label>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <button
                    onClick={fetchCandidateAnswers}
                    disabled={loading || !registrationId}
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 h-100"
                  >
                    {loading ? (
                      <Loader2 size={20} className="spinner-border spinner-border-sm" />
                    ) : (
                      <Search size={20} />
                    )}
                    Show Answers
                  </button>
                </div>
              </div>

              {renderError()}
              {renderCandidateInfo()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateAnswerViewer;