import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Examform.css";
import API_BASE_URL from "./ApiConfig";

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
    examEndTime: '',
    examPrice: '',
    examDate: ''
  });

  const [imageError, setImageError] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValidImage, setIsValidImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/exams`);
    
    eventSource.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.success) {
        const formattedExams = response.data.map(exam => ({
          ...exam,
          startTime: formatTimeString(exam.startTime),
          endTime: formatTimeString(exam.endTime)
        }));
        setExams(formattedExams);
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

  const formatTimeString = (timeStr) => {
    try {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = minutes ? minutes.padStart(2, '0') : '00';
      return `${formattedHours}:${formattedMinutes} ${period || 'AM'}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr;
    }
  };

  const validateImageSize = (file) => {
    const maxSize = 1 * 1024 * 1024; // 1 MB in bytes
    return file.size <= maxSize;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'exam') {
      const selectedExam = exams.find(exam => exam.id === value);
      if (selectedExam) {
        setFormData(prev => ({
          ...prev,
          exam: value,
          examStartTime: selectedExam.startTime,
          examEndTime: selectedExam.endTime,
          examPrice: selectedExam.price,
          examDate: selectedExam.date
        }));
      }
    } else if (name === 'photo' && files?.length > 0) {
      const file = files[0];
      if (validateImageSize(file)) {
        setImageError('');
        setIsValidImage(true);
        setFormData(prev => ({
          ...prev,
          photo: file
        }));
      } else {
        setImageError('Image size must be less than 1 MB. Use https://imagecompressor.11zon.com/en/resize-image/resize-image-to-1mb to compress your image.');
        setIsValidImage(false);
        e.target.value = '';
        setFormData(prev => ({
          ...prev,
          photo: null
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const isFormValid = () => {
    return formData.candidateName && 
           formData.gender && 
           formData.dob && 
           formData.district && 
           formData.pincode && 
           formData.state && 
           formData.phone && 
           formData.exam && 
           isValidImage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.photo) {
      setImageError('Please select a photo under 1 MB');
      return;
    }

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
        <div className="card-header bg-primary text-white text-center">
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
              <label htmlFor="photo" className="form-label">Upload Photo (Max size: 1 MB)</label>
              <input
                type="file"
                id="photo"
                name="photo"
                className="form-control"
                accept="image/*"
                onChange={handleChange}
                required
              />
              {imageError && (
                <div className="text-danger mt-2">
                  {imageError}
                </div>
              )}
              <small className="form-text text-muted">
                If your image is larger than 1 MB, use <a href="https://imagecompressor.11zon.com/en/resize-image/resize-image-to-1mb" target="_blank" rel="noopener noreferrer">this image compression tool</a> to resize it.
              </small>
            </div>

            {formData.examPrice && formData.examStartTime && formData.examEndTime && (
              <div className="mb-3">
                <div className="alert alert-info">
                  <p className="mb-1">Selected Exam Price: ₹{formData.examPrice}</p>
                  <p className="mb-0">Exam Time: {formData.examStartTime} to {formData.examEndTime}</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <button 
                type="submit" 
                className="btn btn-primary px-5"
                disabled={!isFormValid()}
              >
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