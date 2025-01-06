import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Examform.css"
import API_BASE_URL from "./ApiConifg"

const ExamForm = () => {
  const [formData, setFormData] = useState({
    candidateName: '',
    gender: '',
    dob: '',
    district: '',
    pincode: '',
    state: '',
    email: '',
    phone: '',
    photo: null,
    exam: '',
    examStartTime: '',
    examPrice: '',
    examDate: '' // Added new field for exam date
  });

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/exams`);
    
    eventSource.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.success) {
        setExams(response.data);
        setLoading(false);
      } else {
        setError('Failed to load exams');
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      setError('Failed to connect to exam updates');
      setLoading(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'exam') {
      const selectedExam = exams.find(exam => exam.id === value);
      setFormData(prev => ({
        ...prev,
        exam: value,
        examStartTime: selectedExam?.startTime || '',
        examPrice: selectedExam?.price || '',
        examDate: selectedExam?.date || '' // Add date when exam is selected
      }));
    } else if (name === 'photo' && files?.length > 0) {
      setFormData(prev => ({
        ...prev,
        photo: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      dob: new Date(formData.dob).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    navigate('/paymentgateway', { state: formattedData });
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header text-white text-center">
          <h3>Exam Application Form</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="exam" className="form-label">Select Exam</label>
              <select
                id="exam"
                name="exam"
                className="form-select"
                value={formData.exam}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Exam</option>
                {loading ? (
                  <option value="" disabled>Loading exams...</option>
                ) : error ? (
                  <option value="" disabled>Error loading exams</option>
                ) : (
                  exams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.id} - Date: {exam.date} - Time: {exam.startTime} to {exam.endTime} - Marks: {exam.marks} - Price: ₹{exam.price}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="candidateName" className="form-label">Candidate Name</label>
                <input
                  type="text"
                  id="candidateName"
                  name="candidateName"
                  className="form-control"
                  placeholder="Enter your name"
                  value={formData.candidateName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="district" className="form-label">District</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  className="form-control"
                  placeholder="Enter your district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="pincode" className="form-label">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className="form-control"
                  placeholder="Enter your pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="state" className="form-label">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="form-control"
                  placeholder="Enter your state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email ID (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="photo" className="form-label">Upload Photo</label>
              <input
                type="file"
                id="photo"
                name="photo"
                className="form-control"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </div>

            {formData.examPrice && (
              <div className="mb-3">
                <div className="alert alert-info">
                  Selected Exam Price: ₹{formData.examPrice}
                </div>
              </div>
            )}

            <div className="text-center">
              <button type="submit" className="btn btn-primary px-5">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamForm;