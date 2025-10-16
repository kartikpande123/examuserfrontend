import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import API_BASE_URL from './ApiConfig';

const WinnersDisplay = () => {
  const [winnersData, setWinnersData] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/winners`);
      const data = await response.json();
      if (data.success) {
        setWinnersData(data.data.winners);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch winners data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (examTitle, registrationNumber) => {
    setUpdatingStatus(registrationNumber);
    try {
      const response = await fetch(`${API_BASE_URL}/api/winners/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examTitle,
          registrationNumber,
          status: 'received'
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state to reflect the change
        setWinnersData(prevData => {
          const newData = { ...prevData };
          const winner = newData[examTitle].find(w => w.registrationNumber === registrationNumber);
          if (winner) {
            winner.status = 'received';
          }
          return newData;
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const courseTitles = Object.keys(winnersData);

  const getDisplayWinners = () => {
    if (selectedCourse === 'all') {
      return Object.entries(winnersData).flatMap(([course, winners]) =>
        winners.map(winner => ({ ...winner, examTitle: course }))
      );
    }
    return winnersData[selectedCourse] || [];
  };

  const getRankBadgeClass = (rank) => {
    switch (rank) {
      case 1: return 'bg-warning text-dark';
      case 2: return 'bg-secondary text-white';
      case 3: return 'bg-danger text-white';
      default: return 'bg-primary text-white';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'pending' ? 'bg-warning text-dark' : 'bg-success text-white';
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-h-[400px]">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-h-[400px]">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 max-w-[1000px]">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold mb-4">
          🏆 Exam Winners
        </h1>
        
        <select
          className="form-select mb-4 mx-auto max-w-[400px]"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="all">All Courses</option>
          {courseTitles.map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
      </div>

      {getDisplayWinners().length === 0 ? (
        <div className="text-center py-5 text-gray-500">
          <h3>No winners found for the selected course.</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {getDisplayWinners().map((winner) => (
            <div key={winner.registrationNumber} className="rounded-lg shadow-sm border">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getRankBadgeClass(winner.rank)} text-lg`}>
                        #{winner.rank}
                      </span>
                      <h3 className="text-xl font-semibold">
                        {winner.candidateDetails?.name || 'Winner'}
                      </h3>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>Registration: {winner.registrationNumber}</p>
                      <p>Course: {winner.examTitle}</p>
                      <p>Prize Choice: {winner.selectedOption === 'cash' ? 'Cash Prize' : 'Product Prize'}</p>
                      <div className="flex items-center gap-2">
                        <p>Status:</p>
                        <span className={`badge ${getStatusBadgeClass(winner.status)}`}>
                          {winner.status.charAt(0).toUpperCase() + winner.status.slice(1)}
                        </span>
                        {winner.status === 'pending' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(winner.examTitle, winner.registrationNumber)}
                            disabled={updatingStatus === winner.registrationNumber}
                            style={{marginLeft:"2rem"}}
                          >
                            {updatingStatus === winner.registrationNumber ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                            ) : (
                              winner.status === 'pending' ? <AlertCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Mark as Received
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <small className="text-gray-500">{winner.dateCreated}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WinnersDisplay;