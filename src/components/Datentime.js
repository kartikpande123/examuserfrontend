import React, { useState, useEffect, useRef } from "react";
import { Save, Edit } from "lucide-react";
import "./DateNTime.css";
import API_BASE_URL from './ApiConfig';

const ExamDateNTime = () => {
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [marks, setMarks] = useState("");
  const [price, setPrice] = useState("");
  const [exams, setExams] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const formRef = useRef(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/exams`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch exams");
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedExams = result.data
          .filter(exam => exam.dateTime)
          .map(exam => ({
            title: exam.id,
            date: exam.dateTime.date || "",
            startTime: exam.dateTime.startTime ? to24HourFormat(exam.dateTime.startTime) : "",
            endTime: exam.dateTime.endTime ? to24HourFormat(exam.dateTime.endTime) : "",
            marks: exam.dateTime.marks || "",
            price: exam.dateTime.price || "",
          }));
        
        setExams(transformedExams);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      alert("Failed to load existing exams. Please refresh the page.");
    } finally {
      setInitialLoading(false);
    }
  };

  const to24HourFormat = (time12h) => {
    if (!time12h) return "";
    try {
      const [timePart, modifier] = time12h.split(' ');
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      if (modifier === 'PM' && hours < 12) hours = hours + 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    } catch (error) {
      console.error("Time conversion error:", error);
      return "";
    }
  };

  const to12HourFormat = (time24h) => {
    if (!time24h) return "";
    try {
      const [hours24, minutes] = time24h.split(':');
      const hours = parseInt(hours24);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${period}`;
    } catch (error) {
      console.error("Time conversion error:", error);
      return "";
    }
  };

  const isDateTaken = (date) => {
    const otherExams = editIndex !== null 
      ? exams.filter((_, index) => index !== editIndex)
      : exams;
    
    return otherExams.some(exam => exam.date === date);
  };

  const saveExamToDatabase = async (examData) => {
    try {
      setLoading(true);
      const urlSafeTitle = encodeURIComponent(examData.title);

      const response = await fetch(
        `${API_BASE_URL}/api/exams/${urlSafeTitle}/date-time`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: examData.date,
            startTime: to12HourFormat(examData.startTime),
            endTime: to12HourFormat(examData.endTime),
            marks: examData.marks,
            price: examData.price,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save exam");
      }

      await response.json();
      await fetchExams();
    } catch (error) {
      console.error("Error saving exam:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateExam = async () => {
    if (!examTitle || !examDate || !startTime || !endTime || !marks || !price) {
      alert("Please fill in all fields, including marks and price.");
      return;
    }

    if (isDateTaken(examDate)) {
      alert("An exam is already scheduled for this date. Please choose a different date.");
      return;
    }

    const newExam = {
      title: examTitle,
      date: examDate,
      startTime,
      endTime,
      marks,
      price,
    };

    try {
      await saveExamToDatabase(newExam);

      setExamTitle("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setMarks("");
      setPrice("");
      setEditIndex(null);

      alert("Exam saved successfully!");
    } catch (error) {
      alert(`Failed to save exam: ${error.message}`);
    }
  };

  const handleEditExam = (index) => {
    const exam = exams[index];
    setExamTitle(exam.title);
    setExamDate(exam.date);
    setStartTime(exam.startTime);
    setEndTime(exam.endTime);
    setMarks(exam.marks);
    setPrice(exam.price);
    setEditIndex(index);
    
    // Scroll to form smoothly
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (initialLoading) {
    return <div className="loading">Loading exams...</div>;
  }

  return (
    <div className="exam-manager">
      <h2 className="manager-title">Manage Exams</h2>
      <p className="manager-description">
        Add, edit, or delete exams with their date, time, marks, and price.
      </p>

      <div className="exam-inputs" ref={formRef}>
        <label>Exam Title:</label>
        <input
          type="text"
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
          placeholder="Enter exam title"
          className="styled-input"
          disabled={loading}
        />
        <label>Exam Date:</label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="styled-input"
          disabled={loading}
          min={new Date().toISOString().split('T')[0]}
        />
        <label>Start Time:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="styled-input"
          disabled={loading}
        />
        <label>End Time:</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="styled-input"
          disabled={loading}
        />
        <label>Total Marks:</label>
        <input
          type="number"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          placeholder="Enter total marks"
          className="styled-input"
          disabled={loading}
        />
        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          className="styled-input"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleAddOrUpdateExam}
          className="action-button"
          disabled={loading}
        >
          <Save size={20} />
          {loading ? "Saving..." : editIndex !== null ? "Update Exam" : "Add Exam"}
        </button>
      </div>

      {exams.length > 0 && (
        <div className="exam-list">
          <h3 className="section-heading">Exam List</h3>
          <ul>
            {exams.map((exam, index) => (
              <li key={index} className="exam-item">
                <div className="exam-details">
                  <h4 className="exam-title">{exam.title}</h4>
                  <p className="exam-datetime">
                    Date: {exam.date}
                    <br />
                    Time: {to12HourFormat(exam.startTime)} - {to12HourFormat(exam.endTime)}
                    <br />
                    Marks: {exam.marks}
                    <br />
                    Price: ${exam.price}
                  </p>
                </div>
                <div className="exam-actions">
                  <button
                    type="button"
                    onClick={() => handleEditExam(index)}
                    className="edit-button"
                    disabled={loading}
                  >
                    <Edit size={16} /> Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExamDateNTime;