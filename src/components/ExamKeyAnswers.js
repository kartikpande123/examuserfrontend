import React, { useState, useEffect } from "react";
import { FileText, ExternalLink, Download } from "lucide-react";
import API_BASE_URL from "./ApiConifg"

const ExamKeyAnswer = () => {
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQAData();
  }, []);

  const fetchQAData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exam-qa`);
      if (!response.ok) {
        throw new Error("Failed to fetch Q&A data");
      }
      const data = await response.json();
      // Convert object to array and sort by exam title
      const qaArray = Object.values(data.data || {}).sort((a, b) =>
        a.examTitle.localeCompare(b.examTitle)
      );
      setQaData(qaArray);
    } catch (err) {
      setError("No key answers available");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0 h4">
                <FileText className="me-2" size={24} />
                Available Q&A Documents
              </h2>
            </div>
            <div className="card-body">
              {qaData.length === 0 ? (
                <div className="text-center py-5">
                  <h3 className="text-muted">No Q&A documents available</h3>
                  <p className="text-muted">Check back later for updates</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="border-0">Exam Title</th>
                        <th scope="col" className="border-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qaData.map((qa) => (
                        <tr key={qa.id}>
                          <td className="align-middle">
                            <h5 className="mb-1">{qa.examTitle}</h5>
                            <small className="text-muted">
                              Added: {new Date(qa.uploadedAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="text-center align-middle">
                            <a
                              href={qa.qaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              title="Open Q&A"
                            >
                              <ExternalLink size={18} className="me-2" />
                              View Q&A
                            </a>
                            <a
                              href={qa.qaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm ms-2"
                              title="Download Q&A"
                            >
                              <Download size={18} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer bg-light">
              <small className="text-muted">
                Click on "View Q&A" to open the document in Google Drive
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamKeyAnswer;
