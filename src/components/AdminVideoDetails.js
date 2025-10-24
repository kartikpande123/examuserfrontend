import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from './ApiConfig';

const VideoSyllabusDetails = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [syllabusTitle, setSyllabusTitle] = useState("");
  const [fees, setFees] = useState("");
  const [duration, setDuration] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalCategory, setOriginalCategory] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [videoSyllabi, setVideoSyllabi] = useState({});
  const [fileSelectedMessage, setFileSelectedMessage] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchVideoSyllabi();
  }, []);

  const handleFeesChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setFees("");
      return;
    }
    if (/^\d+$/.test(value)) {
      if (value.length > 1 && value.startsWith('0')) {
        setFees(value.replace(/^0+/, ''));
      } else {
        setFees(value);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videosyllabuscategories`);
      if (!response.ok) throw new Error("Failed to fetch video syllabus categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching video syllabus categories:", error);
      alert("Failed to fetch video syllabus categories");
    }
  };

  const fetchVideoSyllabi = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/video-syllabi`);
      if (!response.ok) throw new Error("Failed to fetch video syllabi");
      const data = await response.json();
      setVideoSyllabi(data);
    } catch (error) {
      console.error("Error fetching video syllabi:", error);
      alert("Failed to fetch video syllabi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSyllabusTitle("");
    setFees("");
    setDuration("");
    setVideoFile(null);
    setIsEditing(false);
    setOriginalCategory("");
    setOriginalTitle("");
    setFileSelectedMessage("");
    const fileInput = document.getElementById("videoFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleEdit = (category, title, details) => {
    setSelectedCategory(category);
    setSyllabusTitle(title);
    setFees(details.fees ? details.fees.toString() : "0");
    if (details.duration && details.duration !== "N/A") {
      const durationMatch = details.duration.match(/(\d+)/);
      const durationNumber = durationMatch ? parseInt(durationMatch[1]) : "";
      setDuration(isNaN(durationNumber) ? "" : durationNumber.toString());
    } else {
      setDuration("");
    }
    setIsEditing(true);
    setOriginalCategory(category);
    setOriginalTitle(title);
    setFileSelectedMessage("");
    const fileInput = document.getElementById("videoFileInput");
    if (fileInput) fileInput.value = "";
    setVideoFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setDuration("");
      return;
    }
    if (/^\d+$/.test(value)) {
      if (value.length > 1 && value.startsWith('0')) {
        setDuration(value.replace(/^0+/, ''));
      } else {
        setDuration(value);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        console.log("File selected:", file.name, "Type:", file.type, "Size:", file.size, "bytes");
        setVideoFile(file);
        setFileSelectedMessage(`Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
      } else {
        alert("Please select a video file");
        e.target.value = null;
        setVideoFile(null);
        setFileSelectedMessage("");
      }
    } else {
      console.log("No file selected");
      setVideoFile(null);
      setFileSelectedMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !syllabusTitle) {
      alert("Category and Title are required");
      return;
    }
    if (!isEditing && !videoFile) {
      alert("Please select a video file");
      return;
    }
    try {
      setLoading(true);
      if (isEditing) {
        if (!videoFile) {
          const response = await fetch(`${API_BASE_URL}/api/video-syllabi/${originalCategory}/${originalTitle}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              newCategory: selectedCategory,
              newTitle: syllabusTitle,
              fees: fees || "0",
              duration: duration || "",
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update video syllabus");
          }
          alert("Video syllabus updated successfully!");
        } else {
          const metadataResponse = await fetch(`${API_BASE_URL}/api/video-syllabi/${originalCategory}/${originalTitle}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              newCategory: selectedCategory,
              newTitle: syllabusTitle,
              fees: fees || "0",
              duration: duration || "",
            }),
          });
          if (!metadataResponse.ok) {
            const errorData = await metadataResponse.json();
            throw new Error(errorData.error || "Failed to update video syllabus metadata");
          }
          const fileFormData = new FormData();
          fileFormData.append("videoFile", videoFile);
          console.log("Uploading file:", videoFile.name, videoFile.type, videoFile.size);
          const fileResponse = await fetch(`${API_BASE_URL}/api/video-syllabi/${selectedCategory}/${syllabusTitle}/file`, {
            method: "PUT",
            body: fileFormData,
          });
          if (!fileResponse.ok) {
            const errorData = await fileResponse.json();
            throw new Error(errorData.error || "Failed to update video file");
          }
          alert("Video syllabus with file updated successfully!");
        }
      } else {
        console.log("Final check before submission:");
        console.log("videoFile state variable exists:", videoFile !== null);
        if (videoFile) {
          console.log("videoFile properties:", {
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size,
            lastModified: videoFile.lastModified
          });
        }
        const fileInput = document.getElementById("videoFileInput");
        console.log("File input element value:", fileInput ? fileInput.value : "No element");
        console.log("File input has files:", fileInput && fileInput.files ? fileInput.files.length > 0 : false);
        const formData = new FormData();
        if (!videoFile) {
          throw new Error("Video file is required");
        }
        formData.append("videoFile", videoFile);
        formData.append("category", selectedCategory);
        formData.append("title", syllabusTitle);
        formData.append("fees", fees || "0");
        formData.append("duration", duration || "");
        console.log("FormData entries:");
        for (let pair of formData.entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File - ${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
        console.log("Sending POST request to:", `${API_BASE_URL}/api/video-syllabi`);
        const response = await fetch(`${API_BASE_URL}/api/video-syllabi`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const responseText = await response.text();
          console.error("Server response text:", responseText);
          let errorMessage = "Failed to create video syllabus";
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        alert("Video syllabus created successfully!");
      }
      resetForm();
      fetchVideoSyllabi();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} video syllabus:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} video syllabus: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSyllabus = async (category, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from "${category}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/video-syllabi/${category}/${title}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete video syllabus");
      }
      fetchVideoSyllabi();
      alert("Video syllabus deleted successfully!");
    } catch (error) {
      console.error("Error deleting video syllabus:", error);
      alert(`Failed to delete video syllabus: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="p-4 shadow rounded mb-4" style={{ backgroundColor: "#f0f8ff" }}>
            <h2 className="text-center mb-4" style={{ color: "#4682B4" }}>
              {isEditing ? "Edit Video Syllabus" : "Add Video Syllabus"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label className="form-label">Select Category*</label>
                <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Syllabus Title*</label>
                <input type="text" className="form-control" value={syllabusTitle} onChange={(e) => setSyllabusTitle(e.target.value)} placeholder="Enter syllabus title" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Fees</label>
                <input type="text" className="form-control" value={fees} onChange={handleFeesChange} placeholder="Enter fees amount" />
              </div>
              <div className="mb-3">
                <label className="form-label">Duration (in days)</label>
                <input type="text" className="form-control" value={duration} onChange={handleDurationChange} placeholder="Enter duration in days (e.g., 30)" />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {isEditing ? "Video File (optional - leave empty to keep current file)" : "Video File*"}
                </label>
                <div className="input-group">
                  <input id="videoFileInput" type="file" className="form-control" accept="video/*" onChange={handleFileChange} required={!isEditing} />
                </div>
                {fileSelectedMessage && (
                  <div className="form-text text-success mt-1">
                    <i className="bi bi-check-circle"></i> {fileSelectedMessage}
                  </div>
                )}
                <div className="form-text mt-1">All video formats are accepted (MP4, MOV, AVI, etc.).</div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn flex-grow-1" style={{ backgroundColor: "#4682B4", color: "white" }} disabled={loading}>
                  {loading ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Syllabus" : "Save Syllabus")}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>Cancel</button>
                )}
              </div>
            </form>
          </div>
          <div className="p-4 shadow rounded" style={{ backgroundColor: "#f0f8ff" }}>
            <h2 className="text-center mb-4" style={{ color: "#4682B4" }}>Existing Video Syllabi</h2>
            {loading && !isEditing ? (
              <div className="text-center">Loading video syllabi...</div>
            ) : Object.keys(videoSyllabi).length === 0 ? (
              <div className="text-center">No video syllabi found</div>
            ) : (
              Object.entries(videoSyllabi).map(([category, syllabi]) => (
                <div key={category} className="mb-4">
                  <h4 className="p-2 rounded" style={{backgroundColor:"#46a3ff"}}>{category}</h4>
                  <ul className="list-group">
                    {Object.entries(syllabi).map(([title, details]) => (
                      <li key={title} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="mb-0">{title}</h5>
                          <div>
                            <a href={details.fileUrl} className="btn btn-sm btn-info me-2" target="_blank" rel="noopener noreferrer">View</a>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(category, title, details)} disabled={loading}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSyllabus(category, title)} disabled={loading}>Delete</button>
                          </div>
                        </div>
                        <div className="small">
                          <div><strong>Fees:</strong> {details.fees > 0 ? `₹${details.fees}` : 'Free'}</div>
                          <div><strong>Duration:</strong> {details.duration}</div>
                          <div><strong>Created:</strong> {new Date(details.createdAt).toLocaleString()}</div>
                          {details.updatedAt && details.updatedAt !== details.createdAt && (
                            <div><strong>Updated:</strong> {new Date(details.updatedAt).toLocaleString()}</div>
                          )}
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

export default VideoSyllabusDetails;