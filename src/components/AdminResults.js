import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';

const AdminExamResults = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/all-exam-results`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const formattedExams = data.data.map(exam => ({
            examName: exam.examId,
            results: exam.candidates.map(candidate => ({
              ...candidate,
              registrationNumber: candidate.registrationId
            }))
          }));
          setExams(formattedExams);
        }
      } catch (err) {
        setError('Failed to fetch exam details');
      }
    };
    fetchAllExams();
  }, []);

  const generateTodayResults = async () => {
    setGenerating(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/today-exam-results`);
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Today\'s exam results generated successfully!');
        const examExists = exams.some(exam => exam.examName === data.examDetails.examName);
        if (!examExists) {
          setExams(prev => [...prev, {
            examName: data.examDetails.examName,
            ...data
          }]);
        }
        setResults(data);
        setSelectedExam(data.examDetails.examName);
      } else {
        setError(data.message || 'Failed to generate results');
      }
    } catch (err) {
      setError('An error occurred while generating results');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!selectedExam) {
      setResults(null);
      return;
    }

    const selectedExamData = exams.find(exam => exam.examName === selectedExam);
    if (selectedExamData) {
      setResults({
        examDetails: {
          examName: selectedExamData.examName,
          totalMarks: selectedExamData.totalMarks
        },
        results: selectedExamData.results || []
      });
    }
  }, [selectedExam, exams]);

  const getSubmissionStatus = (result) => {
    if (result.submitted === true) {
      return { status: 'Submitted', className: 'text-success' };
    } else if (!result.used) {
      return { status: 'Not Attended', className: 'text-warning' };
    } else {
      return { status: 'Network Error', className: 'text-danger' };
    }
  };

  const filteredResults = results?.results?.filter(result => {
    const searchTermLower = searchTerm.toLowerCase();
    if (searchType === 'name') {
      return result.candidateName?.toLowerCase().includes(searchTermLower);
    } else {
      return result.registrationNumber?.toLowerCase().includes(searchTermLower);
    }
  });

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-expand-lg navbar-light bg-primary text-white p-3 rounded shadow-sm">
        <div className="container-fluid justify-content-between">
          <div>
            <h1 className="navbar-brand mb-0 text-white">Exam Results Dashboard</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <select
              className="form-select"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{ width: '250px' }}
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.examName} value={exam.examName}>
                  {exam.examName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={generateTodayResults}
              disabled={generating}
              className="btn btn-light btn-lg text-primary fw-bold shadow"
            >
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                'Generate Today\'s Results'
              )}
            </button>
          </div>
        </div>
      </nav>

      {successMessage && (
        <div className="alert alert-success mt-4 d-flex align-items-center">
          <div>{successMessage}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-4 d-flex align-items-center">
          <div>{error}</div>
        </div>
      )}

      {loading && !generating && (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {results && (
        <div className="card mt-4 shadow">
          <div className="card-header bg-primary text-white">
            <h2 className="h5 mb-0">{results.examDetails.examName}</h2>
            <div className="mt-2">
              <strong>Total Candidates:</strong> {results.results.length}
            </div>
          </div>

          <div className="card-body border-bottom">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Search by ${searchType === 'name' ? 'candidate name' : 'registration number'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    style={{ maxWidth: '200px' }}
                  >
                    <option value="name">Search by Name</option>
                    <option value="regNumber">Search by Reg. Number</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <span className="text-muted">
                  Showing {filteredResults?.length || 0} of {results.results.length} candidates
                </span>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Candidate Name</th>
                    <th scope="col">Reg. Number</th>
                    <th scope="col">Status</th>
                    <th scope="col">Correct</th>
                    <th scope="col">Wrong</th>
                    <th scope="col">Skipped</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults?.sort((a, b) => b.correctAnswers - a.correctAnswers).map((result, index) => {
                    const { status, className } = getSubmissionStatus(result);
                    return (
                      <tr key={result.registrationNumber}>
                        <td>{index + 1}</td>
                        <td>{result.candidateName}</td>
                        <td>{result.registrationNumber}</td>
                        <td className={className}>{status}</td>
                        <td className="text-success fw-bold">{result.correctAnswers || 0}</td>
                        <td className="text-danger fw-bold">{result.wrongAnswers || 0}</td>
                        <td className="text-warning fw-bold">{result.skippedQuestions || 0}</td>
                        <td>{result.totalQuestions || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamResults;