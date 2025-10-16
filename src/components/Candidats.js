import React, { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import API_BASE_URL from './ApiConfig';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, examsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/candidates`),
          fetch(`${API_BASE_URL}/api/admin/exams`)
        ]);

        if (!candidatesRes.ok || !examsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [candidatesData, examsData] = await Promise.all([
          candidatesRes.json(),
          examsRes.json()
        ]);

        const formattedCandidates = candidatesData.candidates.map(candidate => ({
          ...candidate,
          dob: candidate.dob ? new Date(candidate.dob) : null,
          examDate: candidate.examDate,
          examStartTime: candidate.examStartTime,
          examEndTime: candidate.examEndTime
        }));

        setCandidates(formattedCandidates);
        setExams(examsData.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatExamDateTime = (examDate, startTime, endTime) => {
    if (!examDate || !startTime || !endTime) return 'Schedule not set';
    try {
      const formattedDate = format(new Date(examDate), 'dd/MM/yyyy');
      return `${formattedDate} (${startTime} - ${endTime})`;
    } catch {
      return 'Invalid Schedule';
    }
  };

  const filteredCandidates = selectedExam
    ? candidates.filter(candidate => candidate.exam === selectedExam)
    : candidates;

  const PhotoModal = ({ photo, onClose }) => (
    <div 
      className="modal fade show" 
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Candidate Photo</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center">
            <img
              src={photo}
              alt="Candidate"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '500px' }}
              className="img-fluid rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-h-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="card shadow border border-2">
        <div className="card-header bg-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0 fs-4">Candidate List</h2>
            <select 
              className="form-select w-auto"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.examDetails?.name || exam.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ minWidth: '1400px' }}>
            <table className="table table-hover table-bordered mb-0">
              <thead className="table-light">
                <tr className="text-center">
                  <th style={{ width: '50px' }} className="px-4 py-3 border-end">#</th>
                  <th style={{ width: '80px' }} className="px-4 py-3 border-end">Photo</th>
                  <th style={{ width: '180px' }} className="px-4 py-3 border-end">Name</th>
                  <th style={{ width: '160px' }} className="px-4 py-3 border-end">Registration Number</th>
                  <th style={{ width: '120px' }} className="px-4 py-3 border-end">Date of Birth</th>
                  <th style={{ width: '100px' }} className="px-4 py-3 border-end">Gender</th>
                  <th style={{ width: '130px' }} className="px-4 py-3 border-end">Phone</th>
                  <th style={{ width: '130px' }} className="px-4 py-3 border-end">District</th>
                  <th style={{ width: '130px' }} className="px-4 py-3 border-end">State</th>
                  <th style={{ width: '200px' }} className="px-4 py-3 border-end">Exam</th>
                  <th style={{ width: '220px' }} className="px-4 py-3">Exam Schedule</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <tr key={candidate.registrationNumber} className="text-center">
                    <td className="px-4 py-3 border-end align-middle">{index + 1}</td>
                    <td className="px-4 py-3 border-end align-middle">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={`${candidate.candidateName}'s photo`}
                          className="rounded cursor-pointer"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setSelectedPhoto(candidate.photoUrl)}
                        />
                      ) : (
                        <div 
                          className="bg-light rounded d-flex align-items-center justify-content-center text-muted mx-auto"
                          style={{ width: '60px', height: '60px' }}
                        >
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 border-end align-middle text-start">{candidate.candidateName}</td>
                    <td className="px-4 py-3 border-end align-middle">
                      <span className="badge bg-light text-dark border">
                        {candidate.registrationNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-end align-middle">
                      {formatDate(candidate.dob)}
                    </td>
                    <td className="px-4 py-3 border-end align-middle">
                      <span className={`badge ${candidate.gender === 'male' ? 'bg-info' : 'bg-danger'}`}>
                        {candidate.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-end align-middle">{candidate.phone}</td>
                    <td className="px-4 py-3 border-end align-middle">{candidate.district}</td>
                    <td className="px-4 py-3 border-end align-middle">{candidate.state}</td>
                    <td className="px-4 py-3 border-end align-middle">
                      <span className="badge bg-success" style={{ fontSize: '0.85rem', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {candidate.exam}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle" style={{ fontSize: '0.9rem' }}>
                      {formatExamDateTime(
                        candidate.examDate,
                        candidate.examStartTime,
                        candidate.examEndTime
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </div>
  );
};

export default Candidates;