import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import API_BASE_URL from "./ApiConfig";

const ExamResults = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/all-exam-results`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const examsList = data.data.map(exam => ({
            examId: exam.examId,
            totalCandidates: exam.candidates.length
          }));
          setExams(examsList);
        } else {
          setExams([]);
        }
      } catch (err) {
        console.error('Failed to fetch exam list:', err);
        setExams([]);
      }
    };

    fetchAllResults();
  }, []);

  useEffect(() => {
    const fetchExamResults = async () => {
      if (!selectedExam) {
        setResults(null);
        setFilteredResults([]);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/all-exam-results`);
        const data = await response.json();
        
        if (data.success) {
          const selectedExamData = data.data.find(exam => exam.examId === selectedExam);
          
          if (selectedExamData) {
            const formattedResults = {
              examDetails: {
                examName: selectedExamData.examId,
                date: new Date().toISOString().split('T')[0],
                totalMarks: selectedExamData.candidates[0]?.totalQuestions || 0
              },
              results: selectedExamData.candidates.map(candidate => ({
                ...candidate,
                candidateName: candidate.candidateName,
                registrationNumber: candidate.registrationNumber,
                correctAnswers: candidate.correctAnswers,
                wrongAnswers: candidate.wrongAnswers,
                skippedQuestions: candidate.skippedQuestions,
                totalQuestions: candidate.totalQuestions,
                submitted: candidate.submitted,
                used: candidate.used
              })).sort((a, b) => b.correctAnswers - a.correctAnswers)
            };
            
            setResults(formattedResults);
            setFilteredResults(formattedResults.results);
          } else {
            setError('No results found for selected exam');
            setResults(null);
            setFilteredResults([]);
          }
        }
      } catch (err) {
        setError('An error occurred while fetching results');
        setResults(null);
        setFilteredResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, [selectedExam]);

  useEffect(() => {
    if (!results) return;

    const filtered = results.results.filter(result => 
      result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchTerm, results]);

  const getStatusBadge = (submitted, used) => {
    if (submitted) {
      return <span className="badge bg-success">Submitted</span>;
    } else if (!submitted && !used) {
      return <span className="badge bg-warning">Not Attended</span>;
    } else if (used && !submitted) {
      return <span className="badge bg-danger">Network Error</span>;
    }
    return null;
  };

  return (
    <div className="container-fluid px-3 px-md-5 py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-primary rounded-4 p-4 shadow-lg">
            <div className="row align-items-center">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <h1 className="text-white fs-3 mb-0">Exam Results Dashboard</h1>
                <p className="text-white-50 mb-0 mt-1">View and track examination performance</p>
              </div>
              <div className="col-12 col-md-6">
                <div className="position-relative">
                  <select
                    className="form-select form-select-lg shadow-sm border-0"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    style={{ 
                      borderRadius: '12px',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="">
                      {exams.length === 0 ? 'No exams available' : 'Select an Exam'}
                    </option>
                    {exams.map((exam) => (
                      <option key={exam.examId} value={exam.examId}>
                        {exam.examId} ({exam.totalCandidates} candidates)
                      </option>
                    ))}
                  </select>
                  <Search 
                    className="position-absolute text-primary" 
                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)' }}
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-lg shadow-sm border-0"
                placeholder="Search by name or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  borderRadius: '12px',
                  paddingLeft: '45px'
                }}
              />
              <Search 
                className="position-absolute text-muted" 
                style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}
                size={20}
              />
            </div>
            {searchTerm && (
              <div className="mt-2 text-muted small">
                Found {filteredResults.length} matching results
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <div className="me-3">⚠️</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {results && (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="card-header bg-primary text-white p-4">
            <h2 className="h5 mb-3">{results.examDetails.examName}</h2>
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white bg-opacity-10 rounded-3">
                  <div className="text-white-50 small mb-1">Date</div>
                  <div className="fw-bold">{results.examDetails.date}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white bg-opacity-10 rounded-3">
                  <div className="text-white-50 small mb-1">Total Questions</div>
                  <div className="fw-bold">{results.examDetails.totalMarks}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white bg-opacity-10 rounded-3">
                  <div className="text-white-50 small mb-1">Candidates</div>
                  <div className="fw-bold">{results.results.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 text-uppercase small fw-bold" style={{ padding: '1rem' }}>Rank</th>
                    <th className="border-0 text-uppercase small fw-bold">Candidate</th>
                    <th className="border-0 text-uppercase small fw-bold">Reg. Number</th>
                    <th className="border-0 text-uppercase small fw-bold">Status</th>
                    <th className="border-0 text-uppercase small fw-bold text-center">Correct</th>
                    <th className="border-0 text-uppercase small fw-bold text-center">Wrong</th>
                    <th className="border-0 text-uppercase small fw-bold text-center">Skipped</th>
                    <th className="border-0 text-uppercase small fw-bold text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result, index) => (
                      <tr key={result.registrationNumber}>
                        <td className="fw-bold" style={{ padding: '1rem' }}>#{index + 1}</td>
                        <td>
                          <div className="fw-bold">{result.candidateName}</div>
                        </td>
                        <td className="text-muted">{result.registrationNumber}</td>
                        <td>{getStatusBadge(result.submitted, result.used)}</td>
                        <td className="text-center">
                          <span className="badge bg-success-subtle text-success px-3 py-2">
                            {result.correctAnswers}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-danger-subtle text-danger px-3 py-2">
                            {result.wrongAnswers}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning-subtle text-warning px-3 py-2">
                            {result.skippedQuestions}
                          </span>
                        </td>
                        <td className="text-center fw-bold">{result.totalQuestions}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No results found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!selectedExam && !loading && exams.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '4rem' }}>📋</div>
          <h3 className="h5 text-muted mb-2">No Exams Found</h3>
          <p className="text-muted small mb-0">There are currently no exam results available in the system.</p>
        </div>
      )}

      {!selectedExam && !loading && exams.length > 0 && (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '4rem' }}>📊</div>
          <h3 className="h5 text-muted mb-2">Select an Exam to View Results</h3>
          <p className="text-muted small mb-0">Choose an exam from the dropdown menu above to see detailed results.</p>
        </div>
      )}
    </div>
  );
};

export default ExamResults;