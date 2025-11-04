import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from "./ApiConfig";
const PdfSyllabusDetails = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [syllabusTitle, setSyllabusTitle] = useState("");
  const [fees, setFees] = useState("");
  const [duration, setDuration] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalCategory, setOriginalCategory] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [pdfSyllabi, setPdfSyllabi] = useState({});
  const [fileSelectedMessage, setFileSelectedMessage] = useState("");
  const [imageSelectedMessage, setImageSelectedMessage] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchPdfSyllabi();
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
      const response = await fetch(`${API_BASE_URL}/api/pdfsyllabuscategories`);
      if (!response.ok) throw new Error("Failed to fetch PDF syllabus categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching PDF syllabus categories:", error);
      alert("Failed to fetch PDF syllabus categories");
    }
  };

  const fetchPdfSyllabi = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi`);
      if (!response.ok) throw new Error("Failed to fetch PDF syllabi");
      const data = await response.json();
      setPdfSyllabi(data);
    } catch (error) {
      console.error("Error fetching PDF syllabi:", error);
      alert("Failed to fetch PDF syllabi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSyllabusTitle("");
    setFees("");
    setDuration("");
    setPdfFile(null);
    setImageFile(null);
    setIsEditing(false);
    setOriginalCategory("");
    setOriginalTitle("");
    setFileSelectedMessage("");
    setImageSelectedMessage("");

    const pdfInput = document.getElementById("pdfFileInput");
    const imageInput = document.getElementById("imageFileInput");
    if (pdfInput) pdfInput.value = "";
    if (imageInput) imageInput.value = "";
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
    setImageSelectedMessage("");

    const pdfInput = document.getElementById("pdfFileInput");
    const imageInput = document.getElementById("imageFileInput");
    if (pdfInput) pdfInput.value = "";
    if (imageInput) imageInput.value = "";
    setPdfFile(null);
    setImageFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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
      if (file.type === "application/pdf") {
        console.log("PDF selected:", file.name, "Type:", file.type, "Size:", file.size, "bytes");
        setPdfFile(file);
        setFileSelectedMessage(`Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      } else {
        alert("Please select a PDF file");
        e.target.value = null;
        setPdfFile(null);
        setFileSelectedMessage("");
      }
    } else {
      setPdfFile(null);
      setFileSelectedMessage("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (validImageTypes.includes(file.type)) {
        console.log("Image selected:", file.name, "Type:", file.type, "Size:", file.size, "bytes");
        setImageFile(file);
        setImageSelectedMessage(`Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      } else {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        e.target.value = null;
        setImageFile(null);
        setImageSelectedMessage("");
      }
    } else {
      setImageFile(null);
      setImageSelectedMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !syllabusTitle) {
      alert("Category and Title are required");
      return;
    }

    if (!isEditing && !pdfFile) {
      alert("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      
      if (pdfFile) {
        formData.append("pdfFile", pdfFile);
      }
      
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      if (isEditing) {
        formData.append("newCategory", selectedCategory);
        formData.append("newTitle", syllabusTitle);
      } else {
        formData.append("category", selectedCategory);
        formData.append("title", syllabusTitle);
      }
      
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

      let url;
      let method;

      if (isEditing) {
        url = `${API_BASE_URL}/api/pdf-syllabi/${originalCategory}/${originalTitle}`;
        method = "PUT";
      } else {
        url = `${API_BASE_URL}/api/pdf-syllabi`;
        method = "POST";
      }

      console.log(`Sending ${method} request to:`, url);
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Server response text:", responseText);

        let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} PDF syllabus`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      alert(`PDF syllabus ${isEditing ? 'updated' : 'created'} successfully!`);

      resetForm();
      fetchPdfSyllabi();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} PDF syllabus:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} PDF syllabus: ${error.message}`);
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
      const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi/${category}/${title}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete PDF syllabus");
      }

      fetchPdfSyllabi();
      alert("PDF syllabus deleted successfully!");
    } catch (error) {
      console.error("Error deleting PDF syllabus:", error);
      alert(`Failed to delete PDF syllabus: ${error.message}`);
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
              {isEditing ? "Edit PDF Syllabus" : "Add PDF Syllabus"}
            </h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
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

              <div className="mb-3">
                <label className="form-label">Syllabus Title*</label>
                <input
                  type="text"
                  className="form-control"
                  value={syllabusTitle}
                  onChange={(e) => setSyllabusTitle(e.target.value)}
                  placeholder="Enter syllabus title"
                  required
                />
              </div>

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

              <div className="mb-3">
                <label className="form-label">
                  {isEditing ? "PDF File (optional - leave empty to keep current file)" : "PDF File*"}
                </label>
                <div className="input-group">
                  <input
                    id="pdfFileInput"
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required={!isEditing}
                  />
                </div>
                {fileSelectedMessage && (
                  <div className="form-text text-success mt-1">
                    <i className="bi bi-check-circle"></i> {fileSelectedMessage}
                  </div>
                )}
                <div className="form-text mt-1">
                  Only PDF files are accepted.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Thumbnail Image (optional)
                </label>
                <div className="input-group">
                  <input
                    id="imageFileInput"
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                  />
                </div>
                {imageSelectedMessage && (
                  <div className="form-text text-success mt-1">
                    <i className="bi bi-check-circle"></i> {imageSelectedMessage}
                  </div>
                )}
                <div className="form-text mt-1">
                  Accepted formats: JPEG, PNG, GIF, WebP
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn flex-grow-1"
                  style={{ backgroundColor: "#4682B4", color: "white" }}
                  disabled={loading}
                >
                  {loading ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Syllabus" : "Save Syllabus")}
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

          <div className="p-4 shadow rounded" style={{ backgroundColor: "#f0f8ff" }}>
            <h2 className="text-center mb-4" style={{ color: "#4682B4" }}>Existing PDF Syllabi</h2>

            {loading && !isEditing ? (
              <div className="text-center">Loading PDF syllabi...</div>
            ) : Object.keys(pdfSyllabi).length === 0 ? (
              <div className="text-center">No PDF syllabi found</div>
            ) : (
              Object.entries(pdfSyllabi).map(([category, syllabi]) => (
                <div key={category} className="mb-4">
                  <h4 className="p-2 rounded" style={{backgroundColor:"#46a3ff"}}>{category}</h4>
                  <ul className="list-group">
                    {Object.entries(syllabi).map(([title, details]) => (
                      <li key={title} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-start gap-3 flex-grow-1">
                            {details.imageUrl && (
                              <img 
                                src={details.imageUrl} 
                                alt={title}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "8px"
                                }}
                              />
                            )}
                            <div>
                              <h5 className="mb-2">{title}</h5>
                              <div className="small">
                                <div><strong>Fees:</strong> {details.fees > 0 ? `₹${details.fees}` : 'Free'}</div>
                                <div><strong>Duration:</strong> {details.duration}</div>
                                <div><strong>Created:</strong> {new Date(details.createdAt).toLocaleString()}</div>
                                {details.updatedAt && details.updatedAt !== details.createdAt && (
                                  <div><strong>Updated:</strong> {new Date(details.updatedAt).toLocaleString()}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex flex-column gap-1">
                            <a
                              href={details.fileUrl}
                              className="btn btn-sm btn-info"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View PDF
                            </a>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEdit(category, title, details)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteSyllabus(category, title)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
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

export default PdfSyllabusDetails;