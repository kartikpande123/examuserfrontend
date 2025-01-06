import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "./ApiConifg"

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications`);
        setNotifications(response.data.notifications);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center" style={{ 
        border: '3px solid #007BFF', 
        paddingBottom: '10px',
        backgroundColor: "#1a3b5d", 
        color: "white"
      }}>
        Notifications
      </h2>
      {notifications.length === 0 ? (
        <div className="alert alert-info text-center">No notifications available.</div>
      ) : (
        <div className="list-group">
          {notifications.map((notification) => {
            const date = new Date(notification.createdAt);
            const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

            return (
              <div
                key={notification.id}
                className="list-group-item mb-3"
                style={{
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div className="d-flex">
                  {/* Date and Time Column */}
                  <div
                    className="text-center me-3"
                    style={{
                      minWidth: '80px',
                      fontSize: '14px',
                      color: '#6c757d',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#007BFF' }}>{formattedDate}</div>
                    <div>{formattedTime}</div>
                  </div>

                  {/* Message Column */}
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#333',
                      wordBreak: 'break-word',
                      flex: 1,
                    }}
                  >
                    {notification.message || 'No Message'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;