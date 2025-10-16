import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./Questions.css";
import API_BASE_URL from './ApiConfig';

const QuestionManager = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const questionFormRef = useRef(null);
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/exams`);
        if (!response.ok) {
          throw new Error("Failed to fetch exams");
        }
        const result = await response.json();
        if (result.success) {
          setExams(result.data);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setImage(null);
    setEditIndex(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddOrUpdateQuestion = async () => {
    if (!selectedExamId) {
      alert("Please select an exam.");
      return;
    }

    if (!question || options.some((opt) => !opt) || correctAnswer === "") {
      alert("Please fill all fields and select the correct answer.");
      return;
    }

    const formData = new FormData();
    formData.append("question", question);
    formData.append("options", JSON.stringify(options));
    formData.append("correctAnswer", correctAnswer);

    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append("image", blob, "uploaded-image.jpg");
    }

    try {
      if (editIndex === null) {
        // Add new question
        const response = await fetch(
          `${API_BASE_URL}/api/exams/${selectedExamId}/questions`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const result = await response.json();
          alert("Question saved successfully!");
          resetForm();
          const updatedExam = exams.find(exam => exam.id === selectedExamId);
          if (updatedExam) {
            const newQuestion = {
              id: result.questionId,
              question,
              options,
              correctAnswer: parseInt(correctAnswer, 10),
              image,
            };
            updatedExam.questions.push(newQuestion);
            setExams([...exams]);
          }
        } else {
          const error = await response.json();
          alert(`Failed to save question: ${error.error}`);
        }
      } else {
        // Update existing question
        const selectedExam = exams.find(exam => exam.id === selectedExamId);
        const questionId = selectedExam.questions[editIndex].id;

        const response = await fetch(
          `${API_BASE_URL}/api/exams/${selectedExamId}/questions/${questionId}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (response.ok) {
          const updatedQuestion = {
            id: questionId,
            question,
            options,
            correctAnswer: parseInt(correctAnswer, 10),
            image,
          };

          selectedExam.questions[editIndex] = updatedQuestion;
          setExams([...exams]);
          alert("Question updated successfully!");
          resetForm();
        } else {
          const error = await response.json();
          alert(`Failed to update question: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("Error saving/updating question:", error);
      alert("An error occurred while saving/updating the question.");
    }
  };

  const handleEditQuestion = (index) => {
    const selectedExam = exams.find(exam => exam.id === selectedExamId);
    const questionToEdit = selectedExam.questions[index];
    setQuestion(questionToEdit.question);
    setOptions(questionToEdit.options);
    setCorrectAnswer(questionToEdit.correctAnswer);
    setImage(questionToEdit.image);
    setEditIndex(index);

    questionFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteQuestion = async (index) => {
    const selectedExam = exams.find(exam => exam.id === selectedExamId);
    const questionId = selectedExam.questions[index].id;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/exams/${selectedExamId}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        selectedExam.questions = selectedExam.questions.filter((_, idx) => idx !== index);
        setExams([...exams]);
        alert("Question deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to delete question: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("An error occurred while deleting the question.");
    }
  };

  const handleImageUpload = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const downloadPDF = async () => {
    const selectedExam = exams.find(exam => exam.id === selectedExamId);
    if (!selectedExam || !selectedExam.questions.length) {
      alert("No questions available to download");
      return;
    }
  
    const pdf = new jsPDF();
    let yOffset = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    const examTitle = selectedExam.title || selectedExam.name || "Exam Questions";
  
    // Helper function to add page number
    const addPageNumber = (pageNumber) => {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${pageNumber}`, pageWidth - 25, pageHeight - 10);
    };
  
    // Helper function to add header to each page
    const addHeader = () => {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(examTitle, margin, 10);
      pdf.line(margin, 12, pageWidth - margin, 12);
    };
  
    // Helper function to check page break
    const checkPageBreak = () => {
      if (yOffset > pageHeight - 40) {
        addPageNumber(pdf.internal.getNumberOfPages());
        pdf.addPage();
        yOffset = 30;
        addHeader();
      }
    };
  
    // Add decorative border to the first page
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));
  
    // Add main title with styling
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(44, 62, 80);
    pdf.text("Question Paper", pageWidth / 2, yOffset, { align: "center" });
    yOffset += lineHeight * 2;
  
    // Add exam title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(52, 73, 94);
    pdf.text(examTitle, pageWidth / 2, yOffset, { align: "center" });
    yOffset += lineHeight * 3;
  
    // Add exam details
    const dateTime = selectedExam.dateTime || selectedExam.examDetails?.dateTime;
    if (dateTime) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      const examDetails = [
        `Date: ${dateTime.date}`,
        `Time: ${dateTime.startTime} to ${dateTime.endTime}`,
        `Total Marks: ${dateTime.marks || "N/A"}`
      ];
      examDetails.forEach(detail => {
        pdf.text(detail, pageWidth / 2, yOffset, { align: "center" });
        yOffset += lineHeight * 1.5;
      });
    }
  
    // Add decorative line
    yOffset += lineHeight;
    pdf.setDrawColor(52, 73, 94);
    pdf.setLineWidth(0.5);
    pdf.line(margin + 20, yOffset, pageWidth - margin - 20, yOffset);
    yOffset += lineHeight * 2;
  
    // Process each question
    for (let i = 0; i < selectedExam.questions.length; i++) {
      const q = selectedExam.questions[i];
      checkPageBreak();
  
      // Question box styling
      pdf.setDrawColor(240, 240, 240);
      pdf.setFillColor(249, 249, 249);
      const questionStartY = yOffset - 5;
  
      // Question number and text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`Q${i + 1}.`, margin, yOffset);
      
      // Question text with word wrap
      pdf.setFont("helvetica", "normal");
      const questionLines = pdf.splitTextToSize(q.question, pageWidth - (margin * 2) - 20);
      pdf.text(questionLines, margin + 15, yOffset);
      yOffset += (questionLines.length * lineHeight) + lineHeight;
  
      // Add image if present
      if (q.image) {
        try {
          const response = await fetch(q.image);
          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise(resolve => {
            reader.onload = () => {
              const imgData = reader.result;
  
              // Set maximum dimensions for the image
              const maxImageWidth = pageWidth - 2 * margin; // Fit within page margins
              const maxImageHeight = 30; // Limit the height to prevent overflow
  
              // Calculate aspect ratio for scaling
              let imgWidth = 100; // Default image width
              let imgHeight = 50; // Default image height
              if (imgWidth > maxImageWidth) {
                const scalingFactor = maxImageWidth / imgWidth;
                imgWidth = maxImageWidth;
                imgHeight *= scalingFactor;
              }
              if (imgHeight > maxImageHeight) {
                const scalingFactor = maxImageHeight / imgHeight;
                imgHeight = maxImageHeight;
                imgWidth *= scalingFactor;
              }
  
              // Center the image within margins
              const xOffset = (pageWidth - imgWidth) / 2;
  
              // Add the image to the PDF
              pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
  
              // Update the Y offset to account for the image height
              yOffset += imgHeight + lineHeight;
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }
  
      // Add options
      pdf.setFontSize(11);
      q.options.forEach((opt, idx) => {
        checkPageBreak();
        const isCorrect = idx === q.correctAnswer;
  
        // Style for options
        if (isCorrect) {
          pdf.setTextColor(46, 125, 50);
          pdf.setFont("helvetica", "bold");
        } else {
          pdf.setTextColor(75, 75, 75);
          pdf.setFont("helvetica", "normal");
        }
  
        const optionLetter = String.fromCharCode(65 + idx);
        const optionText = `${optionLetter}) ${opt}${isCorrect ? ' ✓' : ''}`;
        const optionLines = pdf.splitTextToSize(optionText, pageWidth - (margin * 2) - 25);
        pdf.text(optionLines, margin + 20, yOffset);
        yOffset += (optionLines.length * lineHeight) + 2;
      });
  
      // Draw question box
      const questionEndY = yOffset - 2;
      pdf.setDrawColor(230, 230, 230);
      pdf.rect(margin - 2, questionStartY, pageWidth - (2 * margin) + 4, questionEndY - questionStartY);
  
      // Add spacing between questions
      yOffset += lineHeight * 1.5;
    }
  
    // Add final page number
    addPageNumber(pdf.internal.getNumberOfPages());
  
    // Add footer
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("End of Question Paper", pageWidth / 2, pageHeight - 20, { align: "center" });
  
    // Download the PDF
    pdf.save(`${examTitle.replace(/\s+/g, '_')}_questions.pdf`);
  };

  if (loading) return <div className="loading">Loading exams...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const selectedExam = exams.find(exam => exam.id === selectedExamId);

  return (
    <div className="question-manager">
      <h1 className="title">Question Manager</h1>

      <div className="form-section">
        <label className="field-label">Select Exam</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="styled-select"
        >
          <option value="">Select an exam</option>
          {exams.map(exam => {
            const dateTime = exam.dateTime || exam.examDetails.dateTime;
            return (
              <option key={exam.id} value={exam.id}>
                {exam.id} - Date: {dateTime.date} - Time: {dateTime.startTime} to {dateTime.endTime} - Marks: {dateTime.marks}
              </option>
            );
          })}
        </select>
      </div>

      {selectedExamId && (
        <>
          <div className="form-section" ref={questionFormRef}>
            <label className="field-label">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows="3"
              className="styled-textarea"
            />

            <label className="field-label">Add Image (Optional)</label>
            <span>(Image should be less then 10MB*)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="styled-input"
              ref={fileInputRef}
            />
            {image && <img src={image} alt="Uploaded" className="preview-image" />}

            <div className="options-section">
              {options.map((option, index) => (
                <div key={index} className="option-field">
                  <label>Option {index + 1}</label>
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={option}
                    onChange={(e) =>
                      setOptions(
                        options.map((opt, idx) =>
                          idx === index ? e.target.value : opt
                        )
                      )
                    }
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    placeholder={`Enter option ${index + 1}`}
                    className="styled-input"
                  />
                </div>
              ))}
            </div>

            <label className="field-label">Select Correct Answer</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="styled-select"
            >
              <option value="">Choose correct answer</option>
              {options.map((option, index) => (
                <option key={index} value={index}>
                  Option {index + 1}: {option}
                </option>
              ))}
            </select>

            <div className="button-group">
              <button onClick={handleAddOrUpdateQuestion} className="submit-button">
                {editIndex === null ? "Add Question" : "Update Question"}
              </button>
            </div>
          </div>

          <div className="questions-list">
            <h2 className="list-title">
              Questions for "{selectedExam?.title || selectedExam?.name}"
            </h2>
            {selectedExam?.questions?.length > 0 ? (
              <>
                <ul>
                  {selectedExam.questions.map((q, index) => (
                    <li key={index} className="question-item">
                      <div className="question-details">
                        <strong>
                          {index + 1}. {q.question}
                        </strong>
                        <div className="options">
                          {q.options.map((opt, idx) => (
                            <p
                              key={idx}
                              className={q.correctAnswer === idx ? "correct" : ""}
                            >
                              Option {idx + 1}: {opt}
                            </p>
                          ))}
                        </div>
                        {q.image && (
                          <img src={q.image} alt="Question" className="thumbnail" />
                        )}
                      </div>
                      <div className="actions">
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="button-group">
                  <button 
                    onClick={downloadPDF} 
                    className="download-button"
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '20px',
                      fontSize: '16px'
                    }}
                  >
                    Download Questions as PDF
                  </button>
                </div>
              </>
            ) : (
              <p>No questions saved yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionManager;