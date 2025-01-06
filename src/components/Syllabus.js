import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Download } from 'lucide-react';
import API_BASE_URL from "./ApiConifg"


const SyllabusList = () => {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSyllabusData();
  }, []);

  const fetchSyllabusData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/syllabus`);
      if (!response.ok) {
        throw new Error('Failed to fetch syllabus data');
      }
      const data = await response.json();
      // Convert object to array and sort by exam title
      const syllabusArray = Object.values(data.data || {}).sort((a, b) => 
        a.examTitle.localeCompare(b.examTitle)
      );
      setSyllabusData(syllabusArray);
    } catch (err) {
      setError('Failed to load syllabus data. Please try again later.');
      console.error('Error:', err);
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
                Available Syllabus Documents
              </h2>
            </div>
            <div className="card-body">
              {syllabusData.length === 0 ? (
                <div className="text-center py-5">
                  <h3 className="text-muted">No syllabus documents available</h3>
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
                      {syllabusData.map((syllabus) => (
                        <tr key={syllabus.id}>
                          <td className="align-middle">
                            <h5 className="mb-1">{syllabus.examTitle}</h5>
                            <small className="text-muted">
                              Added: {new Date(syllabus.uploadedAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="text-center align-middle">
                            <a
                              href={syllabus.syllabusLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              title="Open Syllabus"
                            >
                              <ExternalLink size={18} className="me-2" />
                              View Syllabus
                            </a>
                            <a
                              href={syllabus.syllabusLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm ms-2"
                              title="Download Syllabus"
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
                Click on "View Syllabus" to open the document in Google Drive
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusList;