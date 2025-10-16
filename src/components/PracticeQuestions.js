import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./PracticeQuestionStyle.css";
import API_BASE_URL from './ApiConfig';

const PracticeTestQuestionManager = () => {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteQuestionIndex, setDeleteQuestionIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const questionFormRef = useRef(null);
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

  // Fetch categories and exams
  useEffect(() => {
    const fetchPracticeTests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/practice-tests`);
        if (!response.ok) {
          throw new Error("Failed to fetch practice tests");
        }
        const result = await response.json();
        setCategories(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeTests();
  }, []);

  // Fetch questions when exam is selected
  useEffect(() => {
    if (selectedCategory && selectedExamId) {
      fetchQuestions();
    }
  }, [selectedCategory, selectedExamId]);

  // Fetch questions for the selected exam
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/practice-tests/${selectedCategory}/${selectedExamId}/questions`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      
      const result = await response.json();
      setQuestions(result.questions || []);
      
      // Update the categories object with the fetched questions
      const updatedCategories = {...categories};
      if (!updatedCategories[selectedCategory][selectedExamId]) {
        updatedCategories[selectedCategory][selectedExamId] = {};
      }
      updatedCategories[selectedCategory][selectedExamId].questions = result.questions;
      setCategories(updatedCategories);
      
    } catch (err) {
      setError(`Error fetching questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedExamId("");
    setQuestions([]);
  };

  const handleExamChange = (e) => {
    setSelectedExamId(e.target.value);
    resetForm();
  };

  const handleAddOrUpdateQuestion = async () => {
    if (!selectedCategory || !selectedExamId) {
      alert("Please select both a category and an exam.");
      return;
    }
  
    if (!question || options.some((opt) => !opt) || correctAnswer === "") {
      alert("Please fill all fields and select the correct answer.");
      return;
    }
  
    // Set uploading state to show spinner/progress
    setIsUploading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append("question", question);
    formData.append("options", JSON.stringify(options));
    formData.append("correctAnswer", correctAnswer);
  
    // If image exists, process it - add image compression
    if (image) {
      // If image is a File object, optimize before uploading
      if (image instanceof File) {
        try {
          // Check if file size is large enough to warrant compression
          if (image.size > 500000) { // 500KB
            formData.append("compressImage", "true"); // Flag for backend
          }
          formData.append("image", image);
        } catch (error) {
          console.error("Error processing image:", error);
          setIsUploading(false);
          alert("Error processing image. Please try uploading again.");
          return;
        }
      } 
      // Handle blob URLs
      else if (typeof image === 'string' && image.startsWith('blob:')) {
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          formData.append("image", blob, "uploaded-image.jpg");
        } catch (error) {
          console.error("Error processing image:", error);
          setIsUploading(false);
          alert("Error processing image. Please try uploading again.");
          return;
        }
      }
    }
  
    try {
      let response;
      
      if (editIndex === null) {
        // Add new question
        response = await fetch(
          `${API_BASE_URL}/api/practice-tests/${selectedCategory}/${selectedExamId}/questions`,
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        // Update existing question
        const questionId = questions[editIndex].id;
        response = await fetch(
          `${API_BASE_URL}/api/practice-tests/${selectedCategory}/${selectedExamId}/questions/${questionId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      }
  
      if (response.ok) {
        const result = await response.json();
        alert(editIndex === null ? "Question added successfully!" : "Question updated successfully!");
        resetForm();
        
        // Refresh questions
        fetchQuestions();
      } else {
        const errorData = await response.json();
        setError(`Failed to ${editIndex === null ? 'save' : 'update'} question: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${editIndex === null ? 'saving' : 'updating'} question:`, error);
      setError(`An error occurred while ${editIndex === null ? 'saving' : 'updating'} the question.`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Add loading UI elements to the form
  // Add this to your form section
  {isUploading && (
    <div className="upload-overlay">
      <div className="spinner"></div>
      <p>Uploading question and image...</p>
    </div>
  )}

  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index];
    setQuestion(questionToEdit.question);
    setOptions(questionToEdit.options);
    setCorrectAnswer(questionToEdit.correctAnswer.toString());
    setImage(questionToEdit.imageUrl);
    setEditIndex(index);

    questionFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const promptDeleteQuestion = (index) => {
    setDeleteQuestionIndex(index);
    setShowConfirmDialog(true);
  };

  const confirmDeleteQuestion = async () => {
    const index = deleteQuestionIndex;
    if (index === null) return;
    
    const questionId = questions[index].id;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/practice-tests/${selectedCategory}/${selectedExamId}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Question deleted successfully!");
        // Refresh questions
        fetchQuestions();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete question: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("An error occurred while deleting the question.");
    } finally {
      // Reset confirmation dialog state
      setShowConfirmDialog(false);
      setDeleteQuestionIndex(null);
    }
  };

  const cancelDeleteQuestion = () => {
    setShowConfirmDialog(false);
    setDeleteQuestionIndex(null);
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      e.target.dataset.preview = previewUrl;
    }
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
    if (!selectedCategory || !selectedExamId || !questions.length) {
      alert("Please select both a category and an exam with questions.");
      return;
    }
    
    const selectedExam = categories[selectedCategory][selectedExamId];
    
    const pdf = new jsPDF();
    let yOffset = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    const examTitle = selectedExam.title || "Practice Test Questions";
  
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
      pdf.text(`${selectedCategory} - ${examTitle}`, margin, 10);
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
  
    // Add title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("Practice Test Question Paper", pageWidth / 2, yOffset, { align: "center" });
    yOffset += lineHeight * 2;
  
    // Add exam title
    pdf.setFontSize(18);
    pdf.text(`${selectedCategory} - ${examTitle}`, pageWidth / 2, yOffset, { align: "center" });
    yOffset += lineHeight * 3;
  
    // Add exam details if available
    if (selectedExam.dateTime) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      const examDetails = [
        `Date: ${selectedExam.dateTime.date || "N/A"}`,
        `Time: ${selectedExam.dateTime.startTime || "N/A"} to ${selectedExam.dateTime.endTime || "N/A"}`,
        `Total Marks: ${selectedExam.dateTime.marks || "N/A"}`
      ];
      examDetails.forEach(detail => {
        pdf.text(detail, pageWidth / 2, yOffset, { align: "center" });
        yOffset += lineHeight * 1.5;
      });
    }
  
    yOffset += lineHeight * 2;
  
    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      checkPageBreak();
  
      // Question number and text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`Q${i + 1}.`, margin, yOffset);
      
      // Question text with word wrap
      pdf.setFont("helvetica", "normal");
      const questionLines = pdf.splitTextToSize(q.question, pageWidth - (margin * 2) - 20);
      pdf.text(questionLines, margin + 15, yOffset);
      yOffset += (questionLines.length * lineHeight) + lineHeight;
  
      // Add image if present
      if (q.imageUrl) {
        try {
          const response = await fetch(q.imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise(resolve => {
            reader.onload = () => {
              const imgData = reader.result;
              // Add image to PDF with responsive dimensions
              const imgWidth = 100;
              const imgHeight = 50;
              const xOffset = margin + 15;
              pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
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
    const filename = `${selectedCategory}_${examTitle.replace(/\s+/g, '_')}_questions.pdf`;
    pdf.save(filename);
  };

  if (loading && !selectedCategory) return <div className="loading">Loading practice tests...</div>;

  return (
    <div className="question-manager">
      <h1 className="title">Practice Test Question Manager</h1>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this question?</p>
            <div className="dialog-buttons">
              <button onClick={confirmDeleteQuestion} className="confirm-button">
                Yes, Delete
              </button>
              <button onClick={cancelDeleteQuestion} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-section">
        <label className="field-label">Select Category</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="styled-select"
        >
          <option value="">Select a category</option>
          {Object.keys(categories).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <>
            <label className="field-label">Select Exam</label>
            <select
              value={selectedExamId}
              onChange={handleExamChange}
              className="styled-select"
            >
              <option value="">Select an exam</option>
              {Object.keys(categories[selectedCategory] || {}).map(examId => (
                <option key={examId} value={examId}>
                  {categories[selectedCategory][examId].title || examId}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {selectedCategory && selectedExamId && (
        <>
          <div className="form-section" ref={questionFormRef}>
            <h2>{editIndex === null ? "Add New Question" : "Edit Question"}</h2>
            
            <label className="field-label">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows="3"
              className="styled-textarea"
            />

            <label className="field-label">Add Image (Optional)</label>
            <div className="file-upload-info">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="styled-input"
                ref={fileInputRef}
              />
              <span className="file-hint">(Image should be less than 5MB)</span>
            </div>
            
            {image && (
              <div className="image-preview">
                <img 
                  src={typeof image === 'string' ? image : fileInputRef.current?.dataset.preview || ''} 
                  alt="Question Preview" 
                  className="preview-image" 
                />
                <button 
                  className="remove-image" 
                  onClick={() => {
                    setImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  ✕
                </button>
              </div>
            )}

<div className="options-section">
  <div className="options-grid">
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
              {editIndex !== null && (
                <button onClick={resetForm} className="cancel-button">
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="questions-list">
            <h2 className="list-title">
              Questions for "{selectedCategory} - {categories[selectedCategory][selectedExamId]?.title || selectedExamId}"
            </h2>
            
            {loading ? (
              <div className="loading">Loading questions...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : questions.length > 0 ? (
              <>
                <ul>
                  {questions.map((q, index) => (
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
                              Option {idx + 1}: {opt} {q.correctAnswer === idx ? "✓" : ""}
                            </p>
                          ))}
                        </div>
                        {q.imageUrl && (
                          <img src={q.imageUrl} alt="Question" className="thumbnail" />
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
                          onClick={() => promptDeleteQuestion(index)}
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
                  >
                    Download Questions as PDF
                  </button>
                </div>
              </>
            ) : (
              <p>No questions saved yet for this exam.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PracticeTestQuestionManager;