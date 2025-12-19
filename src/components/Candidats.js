import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { format } from 'date-fns';
import API_BASE_URL from './ApiConfig';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

        setCandidates(candidatesData.candidates);
        setExams(examsData.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔄 Sync top & bottom horizontal scroll
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
    ? candidates.filter(c => c.exam === selectedExam)
    : candidates;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  return (
    <div className="container-fluid p-4 candidate-admin">

      {/* ================= INTERNAL CSS ================= */}
      <style>{`
        /* TABLE SIZE & READABILITY */
        .candidate-admin table {
          font-size: 1.05rem;
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

        /* HEADER */
        .candidate-admin .card-header {
          padding: 20px 28px;
        }

        .candidate-admin .card-header h5 {
          font-size: 1.3rem;
          font-weight: 600;
        }

        /* BADGES */
        .candidate-admin .badge {
          font-size: 0.95rem;
          padding: 6px 12px;
        }

        /* PHOTOS */
        .candidate-admin img {
          transition: transform 0.2s ease;
        }

        .candidate-admin img:hover {
          transform: scale(1.07);
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
          background: #e9ecef;
        }
      `}</style>

      <Card className="shadow border-0">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Candidate List</h5>

          <Form.Select
            size="lg"
            style={{ width: '260px' }}
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">All Exams</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.examDetails?.name || exam.id}
              </option>
            ))}
          </Form.Select>
        </Card.Header>

        {/* 🔝 TOP HORIZONTAL SCROLL */}
        <div
          ref={topScrollRef}
          onScroll={() => syncScroll('top')}
          className="top-scroll"
        >
          <div style={{ width: '1600px', height: '1px' }} />
        </div>

        {/* TABLE */}
        <div
          ref={tableScrollRef}
          onScroll={() => syncScroll('table')}
          className="table-responsive"
        >
          <Table bordered hover className="mb-0" style={{ minWidth: '1600px' }}>
            <thead className="table-light text-center">
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Registration No</th>
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
              {filteredCandidates.map((c, i) => (
                <tr key={c.registrationNumber}>
                  <td>{i + 1}</td>

                  <td>
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt="candidate"
                        width="70"
                        height="70"
                        className="rounded-circle border"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedPhoto(c.photoUrl)}
                      />
                    ) : (
                      <Badge bg="secondary">N/A</Badge>
                    )}
                  </td>

                  <td className="text-start fw-semibold">{c.candidateName}</td>

                  <td>
                    <Badge bg="light" text="dark">
                      {c.registrationNumber}
                    </Badge>
                  </td>

                  <td>{formatDate(c.dob)}</td>

                  <td>
                    <Badge bg={c.gender === 'male' ? 'info' : 'danger'}>
                      {c.gender}
                    </Badge>
                  </td>

                  <td>{c.phone}</td>
                  <td>{c.district}</td>
                  <td>{c.state}</td>

                  <td>
                    <Badge bg="success">{c.exam}</Badge>
                  </td>

                  <td>{formatExamDateTime(c.examDate, c.examStartTime, c.examEndTime)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* PHOTO PREVIEW MODAL */}
      <Modal show={!!selectedPhoto} onHide={() => setSelectedPhoto(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Candidate Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img src={selectedPhoto} alt="candidate" className="img-fluid rounded" />
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Candidates;
