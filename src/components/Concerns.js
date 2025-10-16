import React, { useState, useEffect } from "react";
import axios from "axios";
import './Concerns.css'; // Assuming styles are managed in this file
import API_BASE_URL from './ApiConfig';

const Concerns = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  
  // Fetch concerns from the server
  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/concerns`);
        setConcerns(response.data.concerns);
        setLoading(false);
      } catch (err) {
        // Only set error if it's not an empty concerns issue
        if (err.response && err.response.status !== 404) {
          setError("Failed to load concerns");
        }
        setLoading(false);
      }
    };
    
    fetchConcerns();
  }, []);
  
  // Handle deleting a concern
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/concerns/${id}`);
      setConcerns((prevConcerns) => prevConcerns.filter((concern) => concern.id !== id));
    } catch (err) {
      console.error("Failed to delete concern:", err);
      alert("Error deleting concern");
    }
  };
  
  // Handle opening the image modal
  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
  };
  
  // Handle closing the image modal
  const closeModal = () => {
    setModalImage(null);
  };
  
  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="notification-manager">
      <div className="section-heading">Concerns</div>
      <div className="notification-list">
        {concerns.length > 0 ? (
          concerns.map((concern) => (
            <div className="notification-item" key={concern.id}>
              <div className="notification-details">
                {concern.photoUrl && (
                  <img
                    src={concern.photoUrl}
                    alt="Concern"
                    className="concern-image"
                    onClick={() => openModal(concern.photoUrl)}
                  />
                )}
                <div className="notification-message">{concern.concernText}</div>
                <div className="notification-datetime">{concern.createdAt}</div>
              </div>
              <div className="notification-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDelete(concern.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-concerns-message">No concerns to display</div>
        )}
      </div>
      
      {/* Image Modal */}
      {modalImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content">
            <img src={modalImage} alt="Enlarged Concern" />
            <button className="close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Concerns;