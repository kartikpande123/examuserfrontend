import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import API_BASE_URL from './ApiConfig';

const CandidatesNoPhoto = () => {
  const [candidates, setCandidates] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);

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
          dob: candidate.dob ? new Date(candidate.dob) : null
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

  // 🔄 Sync top & table horizontal scroll
  const syncScroll = (source) => {
    if (source === 'top') {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const formatExamDateTime = (examDate, start, end) => {
    if (!examDate || !start || !end) return 'Not Scheduled';
    return `${format(new Date(examDate), 'dd/MM/yyyy')} (${start} - ${end})`;
  };

  const filteredCandidates = selectedExam
    ? candidates.filter(candidate => candidate.exam === selectedExam)
    : candidates;

  if (loading) {
    return <div className="text-center p-5 fs-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger m-4">Error: {error}</div>;
  }

  return (
    <div className="container-fluid p-4 candidate-admin">

      {/* ============ INTERNAL CSS (UI SCALE UP) ============ */}
      <style>{`
        .candidate-admin table {
          font-size: 1.05rem;
          min-width: 1500px;
        }

        .candidate-admin th {
          padding: 18px 16px !important;
          font-weight: 600;
          white-space: nowrap;
        }

        .candidate-admin td {
          padding: 20px 16px !important;
          line-height: 1.7;
          vertical-align: middle;
        }

        .candidate-admin .card-header {
          padding: 20px 28px;
        }

        .candidate-admin .card-header h2 {
          font-size: 1.3rem;
          font-weight: 600;
        }

        .candidate-admin .badge {
          font-size: 0.95rem;
          padding: 6px 12px;
        }

        /* TOP SCROLLBAR */
        .top-scroll {
          height: 24px;
          overflow-x: auto;
          overflow-y: hidden;
        }

        .top-scroll::-webkit-scrollbar {
          height: 16px;
        }

        .top-scroll::-webkit-scrollbar-thumb {
          background: #4b4b4bff;
          border-radius: 10px;
        }

        .top-scroll::-webkit-scrollbar-track {
          background-color: #e9ecef;
        }
      `}</style>

      <div className="card shadow border border-2">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Candidate List</h2>

          <select
            className="form-select form-select-lg w-auto"
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

        {/* 🔝 TOP HORIZONTAL SCROLL */}
        <div
          ref={topScrollRef}
          onScroll={() => syncScroll('top')}
          className="top-scroll"
        >
          <div style={{ width: '1500px', height: '1px' }} />
        </div>

        <div
          className="table-responsive"
          ref={tableScrollRef}
          onScroll={() => syncScroll('table')}
        >
          <table className="table table-hover table-bordered mb-0">
            <thead className="table-light text-center">
              <tr>
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

            <tbody className="text-center">
              {filteredCandidates.map((candidate, index) => (
                <tr key={candidate.registrationNumber}>
                  <td>{index + 1}</td>
                  <td className="text-start fw-semibold">{candidate.candidateName}</td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {candidate.registrationNumber}
                    </span>
                  </td>
                  <td>{formatDate(candidate.dob)}</td>
                  <td>
                    <span className={`badge ${candidate.gender === 'male' ? 'bg-info' : 'bg-danger'}`}>
                      {candidate.gender}
                    </span>
                  </td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.district}</td>
                  <td>{candidate.state}</td>
                  <td>
                    <span className="badge bg-success">{candidate.exam}</span>
                  </td>
                  <td>{formatExamDateTime(candidate.examDate, candidate.examStartTime, candidate.examEndTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatesNoPhoto;
