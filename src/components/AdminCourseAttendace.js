import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfigCourse';

const AdminCourseAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceTime, setAttendanceTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [attendanceData, setAttendanceData] = useState({});

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    header: {
      backgroundColor: '#FDF2F8',
      padding: '20px',
      borderRadius: '8px 8px 0 0',
      marginBottom: '20px',
      borderBottom: '2px solid #F9A8D4'
    },
    headerTitle: {
      color: '#831843',
      fontSize: '24px',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    badge: {
      backgroundColor: '#FBCFE8',
      color: '#831843',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '14px'
    },
    filterContainer: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#FCE7F3',
      borderRadius: '6px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #F9A8D4',
      backgroundColor: 'white',
      color: '#831843',
      minWidth: '200px'
    },
    dateTimeInput: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #F9A8D4',
      backgroundColor: 'white',
      color: '#831843',
      minWidth: '200px'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'auto',
      border: '1px solid #F9A8D4'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '0'
    },
    th: {
      backgroundColor: '#FCE7F3',
      color: '#831843',
      padding: '15px',
      textAlign: 'left',
      borderBottom: '2px solid #F9A8D4',
      fontWeight: 'bold'
    },
    td: {
      padding: '12px 15px',
      borderBottom: '1px solid #F9A8D4',
      borderRight: '1px solid #F9A8D4'
    },
    attendanceButton: {
      padding: '6px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    presentButton: (isActive) => ({
      padding: '6px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      backgroundColor: isActive ? '#059669' : '#D1FAE5',
      color: isActive ? 'white' : '#059669'
    }),
    absentButton: (isActive) => ({
      padding: '6px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      backgroundColor: isActive ? '#DC2626' : '#FEE2E2',
      color: isActive ? 'white' : '#DC2626'
    }),
    saveButton: {
      backgroundColor: '#EC4899',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '10px 24px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      marginTop: '20px',
      hover: {
        backgroundColor: '#BE185D'
      }
    },
    loadingText: {
      textAlign: 'center',
      color: '#831843',
      padding: '40px',
      fontSize: '18px'
    },
    errorText: {
      textAlign: 'center',
      color: '#DC2626',
      padding: '20px'
    },
    formLabel: {
      color: '#831843',
      fontWeight: 'bold',
      display: 'block',
      marginBottom: '8px'
    },
    formGroup: {
      flex: '1',
      minWidth: '250px'
    },
    noDataText: {
      textAlign: 'center',
      color: '#831843',
      padding: '40px',
      fontSize: '16px'
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      const data = await response.json();
      
      if (data.success) {
        // Convert the data object to an array of students
        const studentsArray = Object.entries(data.data).map(([applicationId, student]) => ({
          ...student,
          applicationId
        }));
        
        // Filter only SELECTED students and sort by name
        const selectedStudents = studentsArray
          .filter(student => student.status === 'SELECTED')
          .sort((a, b) => a.name.localeCompare(b.name));
        
        // Extract unique courses
        const uniqueCourses = [...new Set(selectedStudents.map(student => 
          student.courseName
        ))];
        
        setStudents(selectedStudents);
        setCourses(uniqueCourses);
        
        // Initialize attendance data
        const initialAttendance = {};
        selectedStudents.forEach(student => {
          initialAttendance[student.applicationId] = 'absent';
        });
        setAttendanceData(initialAttendance);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch students data');
      setLoading(false);
    }
  };

  const handleAttendanceChange = (applicationId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [applicationId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!attendanceDate || !attendanceTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      const attendancePayload = {
        date: attendanceDate,
        time: attendanceTime,
        attendance: Object.entries(attendanceData).map(([applicationId, status]) => ({
          applicationId,
          status,
          courseName: students.find(s => s.applicationId === applicationId)?.courseName
        }))
      };

      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendancePayload)
      });

      if (response.ok) {
        alert('Attendance saved successfully!');
      } else {
        throw new Error('Failed to save attendance');
      }
    } catch (err) {
      alert('Failed to save attendance: ' + err.message);
    }
  };

  // Filter students based on selected course and ensure they remain sorted by name
  const filteredStudents = selectedCourse === 'all'
    ? students
    : students.filter(student => student.courseName === selectedCourse);

  if (loading) return <div style={styles.loadingText}>Loading students data...</div>;
  if (error) return <div style={styles.errorText}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          Attendance Management
          <span style={styles.badge}>
            {filteredStudents.length} Students
          </span>
        </h2>
        <div style={styles.filterContainer}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Select Course:
            </label>
            <select
              style={styles.select}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Date:
            </label>
            <input
              type="date"
              style={styles.dateTimeInput}
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Time:
            </label>
            <input
              type="time"
              style={styles.dateTimeInput}
              value={attendanceTime}
              onChange={(e) => setAttendanceTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {filteredStudents.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr. No</th>
                <th style={styles.th}>Application ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.applicationId}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{student.applicationId}</td>
                  <td style={styles.td}>{student.name}</td>
                  <td style={styles.td}>{student.phone}</td>
                  <td style={styles.td}>{student.city}</td>
                  <td style={styles.td}>{student.courseName}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={styles.presentButton(attendanceData[student.applicationId] === 'present')}
                        onClick={() => handleAttendanceChange(student.applicationId, 'present')}
                      >
                        Present
                      </button>
                      <button
                        style={styles.absentButton(attendanceData[student.applicationId] === 'absent')}
                        onClick={() => handleAttendanceChange(student.applicationId, 'absent')}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.noDataText}>
            No students found for the selected course
          </div>
        )}
      </div>

      {filteredStudents.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <button
            style={styles.saveButton}
            onClick={handleSaveAttendance}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#BE185D';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#EC4899';
            }}
          >
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCourseAttendance;