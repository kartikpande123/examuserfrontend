import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from './ApiConfig';

const AdminSyllabusExamManager = () => {
  const [selectedExam, setSelectedExam] = useState("");
  const [syllabusLink, setSyllabusLink] = useState("");
  const [examsList, setExamsList] = useState([]);
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamsList();
    fetchSyllabusList();
  }, []);

  const fetchExamsList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/exams`);
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      setExamsList(data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchSyllabusList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/syllabus`);
      if (!response.ok) throw new Error('Failed to fetch syllabus list');
      const data = await response.json();
      setSyllabusList(Object.values(data.data || {}));
    } catch (error) {
      console.error('Error fetching syllabus list:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExam || !syllabusLink) {
      alert("Please select an exam and provide syllabus link.");
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        examTitle: selectedExam,
        syllabusLink
      };

      const url = editingId 
        ? `${API_BASE_URL}/api/syllabus/${editingId}`
        : `${API_BASE_URL}/api/syllabus`
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save syllabus');
      }

      const result = await response.json();
      
      if (editingId) {
        setSyllabusList(syllabusList.map(item => 
          item.id === editingId ? result.data : item
        ));
        setEditingId(null);
      } else {
        setSyllabusList([...syllabusList, result.data]);
      }

      setSelectedExam("");
      setSyllabusLink("");
      
      alert(editingId ? "Syllabus updated successfully!" : "Syllabus saved successfully!");
    } catch (error) {
      alert(`Failed to ${editingId ? 'update' : 'save'} syllabus: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (syllabus) => {
    setSelectedExam(syllabus.examTitle);
    setSyllabusLink(syllabus.syllabusLink);
    setEditingId(syllabus.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this syllabus?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/syllabus/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete syllabus');
        setSyllabusList(syllabusList.filter(item => item.id !== id));
      } catch (error) {
        alert(`Failed to delete syllabus: ${error.message}`);
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          <a className="navbar-brand" href="/" style={{fontSize:"44px", fontWeight:"bold"}}>Exam Manager</a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate("/uploadqa")}
                >
                  Upload Questions
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title mb-4">Manage Syllabus</h2>
                
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="examSelect" className="form-label">Select Exam</label>
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
                    <label htmlFor="syllabusLink" className="form-label">Syllabus Link</label>
                    <input
                      type="url"
                      id="syllabusLink"
                      className="form-control"
                      value={syllabusLink}
                      onChange={(e) => setSyllabusLink(e.target.value)}
                      placeholder="Enter syllabus link"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : editingId ? "Update Syllabus" : "Save Syllabus"}
                  </button>
                </form>

                {syllabusList.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Exam ID</th>
                          <th>Syllabus Link</th>
                          <th>Upload Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syllabusList.map((syllabus) => (
                          <tr key={syllabus.id}>
                            <td>{syllabus.examTitle}</td>
                            <td>
                              <a 
                                href={syllabus.syllabusLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-link btn-sm text-decoration-none"
                              >
                                <LinkIcon size={16} className="me-1" />
                                View Syllabus
                              </a>
                            </td>
                            <td>{formatDateTime(syllabus.uploadedAt)}</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleEdit(syllabus)}
                                className="btn btn-outline-primary btn-sm me-2"
                                disabled={loading}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(syllabus.id)}
                                className="btn btn-outline-danger btn-sm"
                                disabled={loading}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSyllabusExamManager;