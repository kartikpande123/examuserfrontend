import React, { useState, useEffect } from "react";
import { Save, Edit, Trash2 } from "lucide-react";
import "./AdminNotification.css";
import API_BASE_URL from './ApiConfig';

const AdminNotification = () => {
  const [notification, setNotification] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [editingNotification, setEditingNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const saveNotificationToDatabase = async (notificationData, isUpdate = false) => {
    try {
      setLoading(true);
      const url = isUpdate 
        ? `${API_BASE_URL}/api/admin/notifications/${notificationData.id}`
        : `${API_BASE_URL}/api/admin/notifications`;
        
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: notificationData.message,
          createdAt: notificationData.createdAt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateNotification = async () => {
    if (!notification) {
      alert("Please enter a notification message.");
      return;
    }

    try {
      if (editingNotification) {
        // Update existing notification
        const updatedNotification = {
          ...editingNotification,
          message: notification
        };

        await saveNotificationToDatabase(updatedNotification, true);
        
        // Update local state
        setNotifications(notifications.map(notif => 
          notif.id === editingNotification.id 
            ? { ...notif, message: notification }
            : notif
        ));
        
        setEditingNotification(null);
      } else {
        // Create new notification
        const newNotification = {
          message: notification,
          createdAt: new Date().toISOString()
        };

        const result = await saveNotificationToDatabase(newNotification);
        
        // Add new notification to local state
        setNotifications([...notifications, {
          id: result.data.id,
          ...newNotification
        }]);
      }

      // Clear form
      setNotification("");
      alert(editingNotification ? "Notification updated successfully!" : "Notification saved successfully!");
    } catch (error) {
      alert(`Failed to ${editingNotification ? 'update' : 'save'} notification: ${error.message}`);
    }
  };

  const handleEditNotification = (notification) => {
    setNotification(notification.message);
    setEditingNotification(notification);
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }

        setNotifications(notifications.filter(notif => notif.id !== notificationId));
      } catch (error) {
        alert(`Failed to delete notification: ${error.message}`);
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="notification-manager">
      <h2 className="manager-title">Manage Notifications</h2>
      <p className="manager-description">
        Add, edit, or delete notifications for exams.
      </p>

      <div className="notification-inputs">
        <textarea
          value={notification}
          onChange={(e) => setNotification(e.target.value)}
          placeholder="Enter notification message"
          className="styled-input notification-textarea"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleAddOrUpdateNotification}
          className="action-button"
          disabled={loading}
        >
          <Save size={20} />
          {loading ? "Saving..." : editingNotification ? "Update Notification" : "Add Notification"}
        </button>
      </div>

      {notifications.length > 0 && (
        <div className="notification-list">
          <h3 className="section-heading">Notification List</h3>
          <ul>
            {notifications.map((notif) => (
              <li key={notif.id} className="notification-item">
                <div className="notification-details">
                  <p className="notification-message">{notif.message}</p>
                  <p className="notification-datetime">
                    Created: {formatDateTime(notif.createdAt)}
                  </p>
                </div>
                <div className="notification-actions">
                  <button
                    type="button"
                    onClick={() => handleEditNotification(notif)}
                    className="edit-button"
                    style={{ marginRight: "20px" }}
                    disabled={loading}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="delete-button"
                    disabled={loading}
                  >
                    <Trash2 size={16} /> Delete
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

export default AdminNotification;