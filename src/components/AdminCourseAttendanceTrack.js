import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfigCourse';

const AdminCourseAttendanceTrack = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch attendance data
  const fetchAttendanceData = async (course = '', date = '') => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/attendance?`;
      if (course) url += `course=${course}&`;
      if (date) url += `date=${date}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.data);
        // Extract unique courses if not already set
        if (!courses.length) {
          setCourses(Object.keys(data.data));
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedCourse, selectedDate);
  }, [selectedCourse, selectedDate]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    return status === 'present' ? '#28a745' : '#dc3545';
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#dc3545', textAlign: 'center', padding: '2rem' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        color: '#ff69b4',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Attendance Dashboard
      </h2>

      {/* Filters Section */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#fff5f8',
        borderRadius: '8px'
      }}>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ff69b4',
            flex: 1
          }}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ff69b4',
            flex: 1
          }}
        />
      </div>

      {/* Attendance Records */}
      {Object.entries(attendanceData).map(([course, courseDates]) => (
        <div key={course} style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            color: '#ff69b4',
            padding: '0.5rem',
            borderBottom: '2px solid #ff69b4'
          }}>
            {course}
          </h3>
          
          {Object.entries(courseDates).map(([date, dateData]) => (
            <div key={date} style={{
              backgroundColor: '#fff5f8',
              padding: '1rem',
              marginTop: '1rem',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#ff69b4', marginBottom: '1rem' }}>
                Date: {dateData.date} | Time: {dateData.time}
              </h4>
              
              {/* Students List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {dateData.students && Object.entries(dateData.students).map(([studentId, student]) => (
                  <div key={studentId} style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Student ID: {studentId}</span>
                      <span style={{
                        color: 'white',
                        backgroundColor: getStatusColor(student.status),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistics */}
              {dateData.stats && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '4px'
                }}>
                  <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                    <span>Total: {dateData.stats.totalStudents}</span>
                    <span>Present: {dateData.stats.present}</span>
                    <span>Absent: {dateData.stats.absent}</span>
                    <span>Attendance: {dateData.stats.attendancePercentage}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminCourseAttendanceTrack;