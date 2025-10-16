import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from './ApiConfig';

const PracticeTestDetails = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [timeHours, setTimeHours] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [fees, setFees] = useState("");
  const [duration, setDuration] = useState("");
  const [practiceTests, setPracticeTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalCategory, setOriginalCategory] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchPracticeTests();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to fetch categories");
    }
  };

  const fetchPracticeTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/practice-tests`);
      if (!response.ok) throw new Error("Failed to fetch practice tests");
      const data = await response.json();
      setPracticeTests(data);
    } catch (error) {
      console.error("Error fetching practice tests:", error);
      alert("Failed to fetch practice tests");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setExamTitle("");
    setTimeHours("");
    setTimeMinutes("");
    setFees("");
    setDuration("");
    setIsEditing(false);
    setOriginalCategory("");
    setOriginalTitle("");
  };

  const handleEdit = (category, title, details) => {
    // Parse time limit if it exists
    if (details.timeLimit && details.timeLimit !== "N/A") {
      try {
        // Check if timeLimit is in the format HH:MM
        const colonTimeMatch = details.timeLimit.match(/(\d+):(\d+)/);
        if (colonTimeMatch) {
          setTimeHours(colonTimeMatch[1]);
          setTimeMinutes(colonTimeMatch[2]);
        } else {
          // Try the hrs min format as fallback
          const timeMatch = details.timeLimit.match(/(\d+)\s*hrs\s*(\d+)\s*min/i);
          if (timeMatch) {
            setTimeHours(timeMatch[1]);
            setTimeMinutes(timeMatch[2]);
          }
        }
      } catch (error) {
        console.error("Error parsing time limit:", error);
        setTimeHours("");
        setTimeMinutes("");
      }
    } else {
      setTimeHours("");
      setTimeMinutes("");
    }

    setSelectedCategory(category);
    setExamTitle(title);
    setFees(details.fees.toString());
    // Remove 'days' suffix if present and convert to number
    if (details.duration !== "N/A") {
      const durationMatch = details.duration.match(/(\d+)/);
      const durationNumber = durationMatch ? parseInt(durationMatch[1]) : "";
      setDuration(isNaN(durationNumber) ? "" : durationNumber.toString());
    } else {
      setDuration("");
    }
    setIsEditing(true);
    setOriginalCategory(category);
    setOriginalTitle(title);

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !examTitle) {
      alert("Category and Title are required");
      return;
    }

    try {
      setLoading(true);
      
      // Format hours and minutes with leading zeros if needed
      const formattedHours = timeHours ? timeHours.padStart(2, '0') : "";
      const formattedMinutes = timeMinutes ? timeMinutes.padStart(2, '0') : "";
      
      // Format time limit with colon format instead of hrs and min
      const timeLimit = formattedHours && formattedMinutes 
        ? `${formattedHours}:${formattedMinutes}` 
        : "N/A";
      
      if (isEditing) {
        // First delete the original test if category or title has changed
        if (originalCategory !== selectedCategory || originalTitle !== examTitle) {
          await fetch(`${API_BASE_URL}/api/practice-tests/${originalCategory}/${originalTitle}`, {
            method: "DELETE",
          });
        }
      }

      // Format duration to include days suffix when sending to API
      const formattedDuration = duration ? `${duration} days` : "N/A";

      // Then create/update the test
      const requestData = {
        category: selectedCategory,
        title: examTitle,
        fees: fees ? parseFloat(fees) : 0,
        duration: formattedDuration,
        timeLimit
      };

      const response = await fetch(`${API_BASE_URL}/api/practice-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save practice test");
      }

      // Reset form fields
      resetForm();
      
      // Refresh practice tests list
      fetchPracticeTests();
      
      alert(isEditing ? "Practice test updated successfully!" : "Practice test saved successfully!");
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} practice test:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'save'} practice test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (category, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from "${category}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/practice-tests/${category}/${title}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete practice test");
      }

      // Refresh practice tests list
      fetchPracticeTests();
      alert("Practice test deleted successfully!");
    } catch (error) {
      console.error("Error deleting practice test:", error);
      alert(`Failed to delete practice test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle hours input with validation
  const handleHoursChange = (e) => {
    const value = e.target.value;
    // Allow empty input or valid positive numbers, prevent negative sign
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 23)) {
      setTimeHours(value);
    }
  };

  // Handle minutes input with validation
  const handleMinutesChange = (e) => {
    const value = e.target.value;
    // Allow empty input or valid positive numbers, prevent negative sign
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 59)) {
      setTimeMinutes(value);
    }
  };

  // Format input with leading zero on blur
  const handleHoursBlur = () => {
    if (timeHours !== "") {
      // Only pad with zero if there's a value
      const num = parseInt(timeHours);
      if (!isNaN(num) && num <= 23) {
        setTimeHours(num.toString().padStart(2, '0'));
      }
    }
  };

  // Format input with leading zero on blur
  const handleMinutesBlur = () => {
    if (timeMinutes !== "") {
      // Only pad with zero if there's a value
      const num = parseInt(timeMinutes);
      if (!isNaN(num) && num <= 59) {
        setTimeMinutes(num.toString().padStart(2, '0'));
      }
    }
  };

  // Handle duration input to only accept positive numbers
  const handleDurationChange = (e) => {
    const value = e.target.value;
    // Only allow positive numeric input
    if (value === "" || /^[0-9]+$/.test(value)) {
      setDuration(value);
    }
  };

  // Handle fees input to prevent negative values
  const handleFeesChange = (e) => {
    const value = e.target.value;
    // Only allow positive numeric input or empty string
    if (value === "" || (/^\d*\.?\d*$/.test(value) && !value.startsWith("-"))) {
      setFees(value);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="p-4 shadow rounded mb-4" style={{ backgroundColor: "#f0f8ff" }}>
            <h2 className="text-center mb-4" style={{ color: "#4682B4" }}>
              {isEditing ? "Edit Practice Test" : "Add Practice Test"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Category Dropdown */}
              <div className="mb-3">
                <label className="form-label">Select Category*</label>
                <select 
                  className="form-select" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Exam Title */}
              <div className="mb-3">
                <label className="form-label">Exam Title*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={examTitle} 
                  onChange={(e) => setExamTitle(e.target.value)} 
                  placeholder="Enter exam title"
                  required
                />
              </div>
              
              {/* Time Limit with hrs and min */}
              <div className="mb-3">
                <label className="form-label">Time Limit (Optional)</label>
                <div className="d-flex align-items-center">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={timeHours} 
                    onChange={handleHoursChange} 
                    onBlur={handleHoursBlur}
                    placeholder="00"
                    maxLength="2"
                  />
                  <span className="mx-2">hrs</span>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={timeMinutes} 
                    onChange={handleMinutesChange} 
                    onBlur={handleMinutesBlur}
                    placeholder="00"
                    maxLength="2"
                  />
                  <span className="ms-2">min</span>
                </div>
              </div>
              
              {/* Fees */}
              <div className="mb-3">
                <label className="form-label">Fees</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fees} 
                  onChange={handleFeesChange} 
                  placeholder="Enter fees amount" 
                />
              </div>
              
              {/* Duration - Modified to accept only positive numbers */}
              <div className="mb-3">
                <label className="form-label">Duration (in days)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={duration} 
                  onChange={handleDurationChange} 
                  placeholder="Enter duration in days (e.g., 30)" 
                />
              </div>
              
              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn flex-grow-1" 
                  style={{ backgroundColor: "#4682B4", color: "white" }}
                  disabled={loading}
                >
                  {loading ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Test" : "Save Test")}
                </button>
                
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Practice Tests Section */}
          <div className="p-4 shadow rounded" style={{ backgroundColor: "#f0f8ff" }}>
            <h2 className="text-center mb-4" style={{ color: "#4682B4" }}>Existing Practice Tests</h2>
            
            {loading && !isEditing ? (
              <div className="text-center">Loading practice tests...</div>
            ) : Object.keys(practiceTests).length === 0 ? (
              <div className="text-center">No practice tests found</div>
            ) : (
              Object.entries(practiceTests).map(([category, tests]) => (
                <div key={category} className="mb-4">
                  <h4 className="p-2 rounded" style={{backgroundColor:"#46a3ff"}}>{category}</h4>
                  <ul className="list-group">
                    {Object.entries(tests).map(([title, details]) => (
                      <li key={title} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="mb-0">{title}</h5>
                          <div>
                            <button 
                              className="btn btn-sm btn-primary me-2" 
                              onClick={() => handleEdit(category, title, details)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleDeleteTest(category, title)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="small">
                          <div><strong>Fees:</strong> {details.fees > 0 ? `₹${details.fees}` : 'Free'}</div>
                          <div><strong>Duration:</strong> {details.duration}</div>
                          <div><strong>Time Limit:</strong> {details.timeLimit}</div>
                          <div><strong>Created:</strong> {new Date(details.createdAt).toLocaleString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeTestDetails;