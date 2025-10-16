import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Help.css';
import API_BASE_URL from "./ApiConfig"
import {Link} from "react-router-dom"

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
    <div className="help-container d-flex flex-column justify-content-center align-items-center">
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
      <footer className="footer mt-5 bg-light py-3">
        <div className="container text-center">
          <p className="mb-2">
            &copy; 2025/2026 Karnataka Ayan Wholesale Supply Enterprises. All Rights Reserved.
          </p>
          <ul className="list-inline mb-0">
            <li className="list-inline-item">
              <Link to="/termscondition" className="footer-link">Terms and Conditions</Link>
            </li>
            <li className="list-inline-item">|</li>
            <li className="list-inline-item">
              <Link to="/privacypolicy" className="footer-link">Privacy Policy</Link>
            </li>
            <li className="list-inline-item">|</li>
            <li className="list-inline-item">
              <Link to="/cancellationplicy" className="footer-link">Cancellation Policy</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Help;
