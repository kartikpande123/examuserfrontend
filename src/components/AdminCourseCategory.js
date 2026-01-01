import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfigCourse';

const AdminCourseCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      alert('Failed to fetch categories');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      await fetchCategories();
      setNewCategory('');
      alert('Category added successfully');
    } catch (error) {
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete category');
        
        await fetchCategories();
        alert('Category deleted successfully');
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const handleEdit = async () => {
    if (!editValue.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editValue.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update category');
      
      await fetchCategories();
      setEditingId(null);
      setEditValue('');
      alert('Category updated successfully');
    } catch (error) {
      alert('Failed to update category');
    }
  };

  const containerStyle = {
    maxWidth: '500px',
    margin: '2rem auto',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    backgroundColor: '#fff'
  };

  const headerStyle = {
    background: '#ff8fc7',
    padding: '1.5rem',
    color: 'white',
    borderBottom: '3px solid #ff7ab8'
  };

  const inputStyle = {
    border: '2px solid #ff8fc7',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    backgroundColor: '#ff8fc7',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    color: 'white',
    transition: 'all 0.3s ease'
  };

  const categoryItemStyle = {
    border: '2px solid #ff8fc7',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    marginBottom: '0.5rem'
  };

  const iconButtonStyle = {
    border: '2px solid #ff8fc7',
    borderRadius: '8px',
    padding: '0.5rem',
    color: '#ff8fc7',
    backgroundColor: 'white',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle} className="container">
      {/* Header */}
      <div style={headerStyle} className="text-center">
        <h2 className="display-6 fw-bold mb-0">Category Management</h2>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Add Category Section */}
        <div className="d-flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add new category"
            className="form-control"
            style={inputStyle}
            disabled={loading}
          />
          <button
            onClick={handleAddCategory}
            disabled={loading}
            className="btn"
            style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff7ab8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff8fc7'}
          >
            <Plus className="icon" size={20} />
          </button>
        </div>

        {/* Categories List */}
        <div>
          <h3 className="h5 fw-bold mb-3 text-secondary">Categories</h3>
          {categories.map(category => (
            <div key={category.id} className="d-flex align-items-center gap-2 mb-3">
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="form-control"
                    style={inputStyle}
                  />
                  <button
                    onClick={handleEdit}
                    className="btn"
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ff7ab8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff8fc7'}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <div style={categoryItemStyle} className="flex-grow-1">
                    {category.name}
                  </div>
                  <button
                    onClick={() => startEdit(category)}
                    className="btn"
                    style={iconButtonStyle}
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
                    onClick={() => handleDelete(category.id)}
                    className="btn"
                    style={iconButtonStyle}
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
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCategory;