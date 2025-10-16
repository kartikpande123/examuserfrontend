import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import API_BASE_URL from './ApiConfig';

const CandidatesNoPhoto = () => {
  const [candidates, setCandidates] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatExamDateTime = (examDate, startTime, endTime) => {
    if (!examDate || !startTime || !endTime) return 'Schedule not set';
    try {
      return `${format(new Date(examDate), 'dd/MM/yyyy')} (${startTime} - ${endTime})`;
    } catch {
      return 'Invalid Schedule';
    }
  };

  const filteredCandidates = selectedExam
    ? candidates.filter(candidate => candidate.exam === selectedExam)
    : candidates;

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="card shadow border border-2">
        <div className="card-header bg-primary text-white py-3 d-flex justify-content-between">
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
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-bordered mb-0">
              <thead className="table-light">
                <tr className="text-center">
                  <th>#</th>
                  <th>Name</th>
                  <th>Registration Number</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Exam</th>
                  <th>Exam Schedule</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <tr key={candidate.registrationNumber} className="text-center">
                    <td>{index + 1}</td>
                    <td className="text-start">{candidate.candidateName}</td>
                    <td><span className="badge bg-light text-dark">{candidate.registrationNumber}</span></td>
                    <td>{formatDate(candidate.dob)}</td>
                    <td><span className={`badge ${candidate.gender === 'male' ? 'bg-info' : 'bg-danger'}`}>{candidate.gender}</span></td>
                    <td>{candidate.phone}</td>
                    <td>{candidate.district}</td>
                    <td>{candidate.state}</td>
                    <td><span className="badge bg-success">{candidate.exam}</span></td>
                    <td>{formatExamDateTime(candidate.examDate, candidate.examStartTime, candidate.examEndTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatesNoPhoto;
