import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import image from "../Images/LOGO.jpg";
import API_BASE_URL from "./ApiConfig";

const RegenerateHallTicket = () => {
  const [regId, setRegId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to convert 24hr time to 12hr format
  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const generateHallTicket = async (candidate) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add logo
    pdf.addImage(image, 'JPEG', 20, 10, 30, 30);

    // Header styling
    pdf.setFillColor(0, 123, 255);
    pdf.rect(0, 0, 210, 8, 'F');

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('AYAN STUDY ACADEMY', 60, 25);

    // Subtitle
    pdf.setFontSize(16);
    pdf.text('HALL TICKET', 85, 35);

    // Add decorative line
    pdf.setLineWidth(0.5);
    pdf.line(20, 40, 190, 40);

    // Candidate details section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');

    // Create a styled box for registration ID
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, 45, 170, 10, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Registration ID: ${candidate.registrationNumber}`, 25, 51);

    // Main details
    const details = [
      { label: 'Candidate Name', value: candidate.candidateName },
      { label: 'Date of Birth', value: candidate.dob },
      { label: 'Gender', value: candidate.gender },
      { label: 'District', value: candidate.district },
      { label: 'State', value: candidate.state },
      { label: 'Phone Number', value: candidate.phone },
      { label: 'Exam', value: candidate.exam },
      { label: 'Exam Date', value: candidate.examDate }, // Added exam date
      { label: 'Exam Start Time', value: candidate.examStartTime },
      { label: 'Exam End Time', value: candidate.examEndTime }

    ];

    let yPosition = 65;
    details.forEach(({ label, value }) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value || 'Not specified', 80, yPosition);
      yPosition += 10;
    });

    // Add candidate photo if available
    if (candidate.photoUrl) {
      pdf.addImage(candidate.photoUrl, 'JPEG', 140, 60, 35, 45);
      pdf.rect(140, 60, 35, 45);
    }

    // Instructions section
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('IMPORTANT INSTRUCTIONS', 25, yPosition);

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const instructions = [
     "1. Registration must be completed at least 15 minutes prior to the exam.",
        "2. Participants must stay logged in and avoid leaving the platform until the exam begins.",
        "3. Registration ID and Hall Ticket are mandatory for the exam.",
        "4. Ensure a stable internet connection throughout the exam, with at least 300 MB of data available.",
        "5. Once the exam starts, entry will not be granted.",
        "6. The Registration ID is valid only for the selected exams.",
        "7. Only attempted answers will be considered after the exam ends.",
        "8. Result Status Rules:",
        "   - Attempted: Displayed if the user completes and submits all questions in the exam.",
        "   - Network Error: Displayed if any of the following occurs:",
        "      * Interruption from a mobile call.",
        "      * Exiting and reentering the exam tab.",
        "      * Insufficient or exhausted mobile data.",
        "      * Searching for questions on external platforms (e.g., Google).",
        "      * Turning off the web camera during the session.",
        "   - Not Attended: Displayed if the user does not attempt the exam at all."
    ];

    instructions.forEach(instruction => {
      pdf.text('• ' + instruction, 25, yPosition);
      yPosition += 7;
    });

  
    // Save the PDF
    pdf.save(`${candidate.candidateName}_HallTicket.pdf`);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/candidate/${regId}`);
      const { candidate } = response.data;

      if (candidate) {
        await generateHallTicket(candidate);
        alert('Hall ticket has been regenerated!');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Registration ID not found. Please check and try again.');
      } else {
        setError('Failed to regenerate hall ticket. Please try again.');
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Regenerate Hall Ticket</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="mb-3">
              <label htmlFor="regId" className="form-label">
                Registration ID
              </label>
              <input
                type="text"
                className="form-control"
                id="regId"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="Enter your registration ID"
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !regId}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </span>
                ) : (
                  'Search & Generate Hall Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegenerateHallTicket;
