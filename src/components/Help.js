import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Help.css';
import API_BASE_URL from "./ApiConifg"

const Help = () => {
  const [concern, setConcern] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleConcernChange = (e) => {
    setConcern(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData to send the concern and file
    const formData = new FormData();
    formData.append('concern', concern);
    if (file) {
      formData.append('photo', file);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/concern`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Your concern has been submitted successfully!');
      setConcern('');
      setFile(null);
    } catch (error) {
      setMessage('Failed to submit your concern. Please try again later.');
      console.error('Error submitting concern:', error);
    }
  };

  return (
    <div className="help-container d-flex justify-content-center align-items-center">
      <div className="card help-card">
        <div className="card-header">
          <h3 className="help-heading">Help</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="concern" className="form-label">Your Concern</label>
              <textarea
                id="concern"
                className="form-control"
                rows="4"
                value={concern}
                onChange={handleConcernChange}
                placeholder="Describe your concern here...(If you Have Personal Concerns please add your name and phone number...)"
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="fileUpload" className="form-label">Upload Photo (Optional)</label>
              <input
                type="file"
                className="form-control"
                id="fileUpload"
                onChange={handleFileChange}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Submit Concern</button>
          </form>
          {message && (
            <div className="alert alert-info mt-3" role="alert">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;
