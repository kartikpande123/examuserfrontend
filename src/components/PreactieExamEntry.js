import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import API_BASE_URL from './ApiConifg'; // Assume you have this configured

const PracticeExamEntry = () => {
  const [studentId, setStudentId] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState('');
  const [activeExams, setActiveExams] = useState([]);
  const [showExamDetailsModal, setShowExamDetailsModal] = useState(false);
  const navigate = useNavigate();

  const styles = {
    container: {
      backgroundColor: '#f4f6f9',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      maxWidth: '700px',
      width: '100%',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: '12px',
      border: 'none'
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    },
    input: {
      borderRadius: '25px',
      padding: '10px 20px'
    },
    button: {
      borderRadius: '25px',
      padding: '10px 20px',
      fontWeight: 'bold'
    },
    examCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '15px',
      cursor: 'pointer'
    }
  };

  const verifyStudent = async () => {
    if (!studentId.trim()) {
      setError('Please enter a Student ID');
      return;
    }

    try {
      // Verify student
      const studentResponse = await fetch(`${API_BASE_URL}/api/verify-student/${studentId}`);
      const studentData = await studentResponse.json();

      if (!studentData.exists) {
        setError('Student not found');
        return;
      }

      setStudentDetails(studentData.studentDetails);

      // Check exam purchases
      const currentDate = new Date();
      const activeExamList = studentData.studentDetails.purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        const examDuration = purchase.examDetails.duration.includes('days') 
          ? parseInt(purchase.examDetails.duration) 
          : 1;
        const expirationDate = new Date(purchaseDate);
        expirationDate.setDate(expirationDate.getDate() + examDuration);

        return currentDate <= expirationDate;
      });

      if (activeExamList.length === 0) {
        setError('No active exam purchase found');
        return;
      }

      // Set active exams
      setActiveExams(activeExamList);

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  const handleStartExam = (exam) => {
    // Prepare exam session data
    const examSessionData = {
      studentId: studentId,
      examDetails: {
        title: exam.examDetails.title,
        category: exam.examDetails.category,
        duration: exam.examDetails.duration,
        timeLimit: exam.examDetails.timeLimit,
        createdAt: exam.examDetails.createdAt
      },
      purchaseDate: exam.purchaseDate
    };

    // Store exam session data in localStorage
    localStorage.setItem('practiceExamSession', JSON.stringify(examSessionData));
    
    // Navigate to practice exam
    navigate('/practiceexam', { 
      state: { 
        studentId, 
        examDetails: exam.examDetails 
      } 
    });
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h2 className="text-center mb-0">Practice Exam Verification</h2>
        </div>
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="form-label">Enter Student ID</label>
            <input 
              type="text" 
              className="form-control" 
              style={styles.input}
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setError('');
                setActiveExams([]);
              }}
              placeholder="Enter your Student ID"
            />
          </div>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <button 
            className="btn btn-primary w-100" 
            style={styles.button}
            onClick={verifyStudent}
          >
            Verify & Find Exam
          </button>

          {/* Active Exams Display */}
          {activeExams.length > 0 && (
            <div className="mt-4">
              <h4>Your Active Exams</h4>
              {activeExams.map((purchase, index) => (
                <div 
                  key={index} 
                  style={styles.examCard} 
                  className="d-flex justify-content-between align-items-center"
                  onClick={() => handleStartExam(purchase)}
                >
                  <div>
                    <h5>{purchase.examDetails.title}</h5>
                    <p className="mb-1">
                      <strong>Category:</strong> {purchase.examDetails.category}
                    </p>
                    <p className="mb-1">
                      <strong>Duration:</strong> {purchase.examDetails.duration}
                    </p>
                    <p className="mb-0">
                      <strong>Time Limit:</strong> {purchase.examDetails.timeLimit}
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartExam(purchase);
                    }}
                  >
                    Start Exam
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeExamEntry;