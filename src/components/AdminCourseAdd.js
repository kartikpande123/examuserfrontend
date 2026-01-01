import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import API_BASE_URL from './ApiConfigCourse';

const AdminAddCourse = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    courseImage: null,
    startDate: '',
    startTime: '',
    endTime: '',
    pdfLink: '',
    fees: '',
    details: '',
    lastDateToApply: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses');
    }
  };

  const compressImage = (imageFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'courseImage') {
      const file = files[0];
      if (file) {
        try {
          const compressedImage = await compressImage(file);
          setFormData(prev => ({ ...prev, courseImage: compressedImage }));
        } catch (error) {
          console.error('Error compressing image:', error);
          alert('Failed to process image');
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_BASE_URL}/courses/${editingId}`
        : `${API_BASE_URL}/courses`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          fees: Number(formData.fees)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save course');
      }
      
      await fetchCourses();
      resetForm();
      alert(`Course ${editingId ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving course:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete course');
        
        await fetchCourses();
        alert('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course');
      }
    }
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      categoryId: course.categoryId,
      startDate: course.startDate,
      startTime: course.startTime,
      endTime: course.endTime,
      pdfLink: course.pdfLink,
      fees: course.fees,
      details: course.details,
      lastDateToApply: course.lastDateToApply,
      courseImage: course.imageBase64
    });
    
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      categoryId: '',
      courseImage: null,
      startDate: '',
      startTime: '',
      endTime: '',
      pdfLink: '',
      fees: '',
      details: '',
      lastDateToApply: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '2rem auto',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      backgroundColor: '#fff'
    },
    header: {
      background: '#ff8fc7',
      padding: '1.5rem',
      color: 'white',
      borderBottom: '3px solid #ff7ab8'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#666'
    },
    input: {
      border: '2px solid #ff8fc7',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      width: '100%'
    },
    button: {
      backgroundColor: '#ff8fc7',
      border: 'none',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    preview: {
      maxWidth: '200px',
      marginTop: '10px',
      borderRadius: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} className="text-center">
        <h2 className="display-6 fw-bold mb-0">Course Management</h2>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="row">
            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="title" style={styles.label}>Course Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="categoryId" style={styles.label}>Course Category *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="courseImage" style={styles.label}>Course Image</label>
                <input
                  id="courseImage"
                  type="file"
                  name="courseImage"
                  onChange={handleInputChange}
                  style={styles.input}
                  accept="image/*"
                  ref={fileInputRef}
                />
                {formData.courseImage && (
                  <img 
                    src={formData.courseImage} 
                    alt="Course preview" 
                    style={styles.preview}
                  />
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="startDate" style={styles.label}>Start Date *</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="startTime" style={styles.label}>Start Time *</label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="endTime" style={styles.label}>End Time *</label>
                <input
                  id="endTime"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="pdfLink" style={styles.label}>PDF Link</label>
                <input
                  id="pdfLink"
                  type="url"
                  name="pdfLink"
                  value={formData.pdfLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/course-pdf"
                  style={styles.input}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="fees" style={styles.label}>Course Fees (₹) *</label>
                <input
                  id="fees"
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="col-12">
              <div style={styles.formGroup}>
                <label htmlFor="details" style={styles.label}>Course Details *</label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  style={{ ...styles.input, minHeight: '100px' }}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={styles.formGroup}>
                <label htmlFor="lastDateToApply" style={styles.label}>Last Date to Apply *</label>
                <input
                  id="lastDateToApply"
                  type="date"
                  name="lastDateToApply"
                  value={formData.lastDateToApply}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={styles.button}
            disabled={loading}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff7ab8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff8fc7'}
          >
            {loading ? 'Saving...' : (editingId ? 'Update Course' : 'Add Course')}
          </button>
        </form>

        <div className="mt-5">
          <h3 className="h5 fw-bold mb-3 text-secondary">Existing Courses</h3>
          {courses.map(course => (
            <div key={course.id} className="card mb-3 border-pink">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {course.imageBase64 && (
                      <img 
                        src={course.imageBase64} 
                        alt={course.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px', borderRadius: '8px' }}
                      />
                    )}
                    <div>
                      <h5 className="card-title mb-0">{course.title}</h5>
                      <p className="card-text mt-2 mb-1">
                        <small className="text-muted">
                          Start Date: {new Date(course.startDate).toLocaleDateString()}
                        </small>
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          Fees: ₹{course.fees}
                        </small>
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => startEdit(course)}
                      className="btn me-2"
                      style={{ 
                        ...styles.button, 
                        backgroundColor: 'white', 
                        color: '#ff8fc7',border: '2px solid #ff8fc7' 
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#ff8fc7';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#ff8fc7';
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="btn"
                      style={{ 
                        ...styles.button, 
                        backgroundColor: 'white', 
                        color: '#ff8fc7', 
                        border: '2px solid #ff8fc7' 
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#ff8fc7';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#ff8fc7';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAddCourse;