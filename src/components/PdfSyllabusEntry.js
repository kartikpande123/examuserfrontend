import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConifg';
import SecurePdfViewer from './SecurePdfViewer';

export default function PdfSyllabusEntry() {
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify-student-syllabus/${studentId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch student data');
      }
      
      setStudentData(data);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError(error.message);
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Student Syllabus Verification</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="studentId" className="form-label">Enter Student ID:</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g., STD12345"
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Verify'}
                </button>
              </div>
            </div>
          </form>

          {loading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          {studentData && studentData.exists && (
            <div className="mt-4">
              <h3>Student Details</h3>
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{studentData.studentDetails.name}</h5>
                  <p className="card-text">ID: {studentData.studentDetails.id}</p>
                </div>
              </div>

              <h4>Active Syllabuses</h4>
              {studentData.studentDetails.activeSyllabuses.length > 0 ? (
                <div className="row">
                  {studentData.studentDetails.activeSyllabuses.map((syllabus, index) => (
                    <div className="col-md-6 mb-3" key={index}>
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{syllabus.syllabusName}</h5>
                          <p className="card-text">
                            <strong>Purchase Date:</strong> {new Date(syllabus.purchaseDate).toLocaleDateString()}
                          </p>
                          <p className="card-text">
                            <strong>Remaining Days:</strong> {syllabus.remainingDays}
                          </p>
                          {syllabus.pdfUrl && (
                            <SecurePdfViewer pdfUrl={syllabus.pdfUrl} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No active syllabuses found for this student.
                </div>
              )}
            </div>
          )}

          {studentData && !studentData.exists && (
            <div className="alert alert-warning mt-3" role="alert">
              Student not found. Please check the ID and try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}