import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "./ApiConifg"

const UpcomingExams = () => {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/exams`);

    eventSource.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        if (response.success) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          
          const upcoming = response.data.filter(exam => {
            const examDate = new Date(exam.date);
            return examDate >= tomorrow;
          }).sort((a, b) => new Date(a.date) - new Date(b.date));
          
          setUpcomingExams(upcoming);
        } else {
          setError(response.error || 'Failed to load upcoming exams');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to process server data');
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      setError('Connection to server lost. Retrying...');
      eventSource.close();
      setTimeout(() => {
        const newEventSource = new EventSource(`${API_BASE_URL}/api/exams`);
        eventSource = newEventSource;
      }, 5000);
    };

    return () => eventSource.close();
  }, []);

  const handleApplyClick = (exam) => {
    navigate('/examform', { state: { selectedExam: exam.id } });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                   'August', 'September', 'October', 'November', 'December'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDaysUntilExam = (dateStr) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(examDate - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-2">Upcoming Examinations</h1>
        <p className="text-muted" style={{borderBottom:"3px solid blue", fontSize:"24px"}}>
          Prepare for your next challenge
        </p>
      </div>
      
      {upcomingExams.length === 0 ? (
        <div className="card text-center p-4">
          <h3 className="text-muted">No upcoming exams scheduled</h3>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {upcomingExams.map((exam) => (
            <div key={exam.id} className="col">
              <div className="card h-100 shadow-sm hover-shadow transition">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title mb-0">
                      {exam.id}
                    </h5>
                    <span className="badge bg-light text-primary">
                      {exam.marks} Marks
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="mb-3">
                    <small className="text-muted d-block mb-2">
                      {getDaysUntilExam(exam.date)} days remaining
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <i className="bi bi-calendar-event me-2"></i>
                    <span>{formatDate(exam.date)}</span>
                  </div>
                  
                  <div className="mb-3">
                    <i className="bi bi-clock me-2"></i>
                    <span>{exam.startTime} - {exam.endTime}</span>
                  </div>
                  
                  <div className="mb-3">
                    <i className="bi bi-award me-2"></i>
                    <span>Total Marks: {exam.marks}</span>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent border-0">
                  <button 
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleApplyClick(exam)}
                  >
                    Apply Now
                    <i className="bi bi-chevron-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingExams;