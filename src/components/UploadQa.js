import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from './ApiConfig';

const UploadExamQA = () => {
  const [selectedExam, setSelectedExam] = useState("");
  const [qaLink, setQaLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [examsList, setExamsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/exams`);
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      setExamsList(data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Failed to load exams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExam || !qaLink) {
      alert("Please select an exam and provide Q&A link.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/exam-qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          examTitle: selectedExam, 
          qaLink 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save Q&A details.");
      }

      const result = await response.json();
      alert("Exam Q&A saved successfully!");
      setSelectedExam("");
      setQaLink("");
    } catch (error) {
      console.error("Error saving Q&A details:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <a className="navbar-brand" href="/" style={{fontSize:"44px", fontWeight:"bold"}}>
            Upload Q&A
          </a>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Back to Exams
          </button>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title mb-4">Upload Exam Q&A</h2>

                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="examSelect" className="form-label">
                      Select Exam
                    </label>
                    <select
                      id="examSelect"
                      className="form-select"
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select an exam</option>
                      {examsList.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.id} - {exam.dateTime.date} ({exam.dateTime.startTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="qaLink" className="form-label">
                      Q&A Link (PDF)
                    </label>
                    <input
                      type="url"
                      id="qaLink"
                      className="form-control"
                      value={qaLink}
                      onChange={(e) => setQaLink(e.target.value)}
                      placeholder="Enter Q&A PDF link"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadExamQA;