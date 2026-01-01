import React from "react";
import {
  Plus,
  Book,
  FileText,
  CreditCard,
  Video,
  Users,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const AdminCourseDashboard = () => {
  const navigate = useNavigate();

  // Button configurations with Lucide icons
  const buttons = [
    { icon: <Plus />, text: "Add Category", path: "/coursecategory" },
    { icon: <Book />, text: "Add Course", path: "/courseadd" },
    { icon: <FileText />, text: "Application Status", path: "/courseapplicants" },
    { icon: <CreditCard />, text: "Payments", path: "/coursepayments" },
    { icon: <Video />, text: "G-Meet Link", path: "/coursegmeets" },
    { icon: <Users />, text: "Candidates", path: "/coursecandidates" },
    { icon: <CheckCircle />, text: "Check Attendance", path: "/courseattendance" },
    { icon: <Calendar />, text: "Attendance Tracker", path: "/courseattendancetrack" }
  ];

  const handleButtonHover = (e, isHover) => {
    e.currentTarget.style.transform = isHover ? 'translateY(-5px)' : 'translateY(0)';
    e.currentTarget.style.backgroundColor = isHover ? '#ff9dce' : '#ff85c5';
  };

  // CSS Styles
  const styles = {
    // Main container
    dashboardContainer: {
      backgroundColor: '#fff0f7',
      minHeight: '100vh'
    },
    
    // Header
    header: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ff8fc7',
      padding: '20px 40px',
      boxShadow: '0 4px 12px rgba(255, 133, 197, 0.3)',
      position: 'relative'
    },
    
    headerTitle: {
      margin: 0,
      color: '#fff',
      fontSize: '28px',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
    },
    
    // Grid Container
    gridContainer: {
      maxWidth: '1400px',
      margin: '20px auto',
      padding: '0 30px'
    },
    
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '25px',
      padding: '20px 0'
    },
    
    // Buttons
    button: {
      width: '100%',
      backgroundColor: '#ff8fc7',
      border: 'none',
      borderRadius: '10px',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(255, 133, 197, 0.3)',
    },
    
    icon: {
      width: '36px',
      height: '36px',
      marginBottom: '15px',
      color: '#fff',
      strokeWidth: '1.5'
    },
    
    buttonText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#fff',
      marginTop: '10px'
    },
  };

  // Media query styles for responsiveness
  const mediaQueryStyles = `
    @media (max-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 992px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .header-title {
        font-size: 24px;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .dashboard-button {
        padding: 25px 15px;
      }
      
      .button-icon {
        width: 32px;
        height: 32px;
      }
      
      .button-text {
        font-size: 16px;
      }
      
      .header {
        padding: 15px 20px;
      }
      
      .header-title {
        font-size: 20px;
      }
    }
    
    @media (max-width: 576px) {
      .header {
        padding: 15px;
        text-align: center;
      }
      
      .header-title {
        font-size: 18px;
      }
      
      .grid-container {
        padding: 0 15px;
      }
    }
    
    @media (max-width: 380px) {
      .dashboard-button {
        padding: 20px 15px;
      }
      
      .button-icon {
        width: 28px;
        height: 28px;
      }
      
      .button-text {
        font-size: 14px;
      }
    }
  `;

  return (
    <div style={styles.dashboardContainer}>
      {/* Inline styles for media queries */}
      <style>{mediaQueryStyles}</style>
      
      {/* Header with Course Management title */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Course Management</h1>
      </header>

      {/* Dashboard Grid */}
      <div style={styles.gridContainer} className="grid-container">
        <div style={styles.grid} className="dashboard-grid">
          {buttons.map((item, index) => (
            <button
              key={index}
              style={styles.button}
              className="dashboard-btn"
              onClick={() => navigate(item.path)}
              onMouseOver={(e) => handleButtonHover(e, true)}
              onMouseOut={(e) => handleButtonHover(e, false)}
            >
              <div style={styles.icon} className="button-icon">{item.icon}</div>
              <span style={styles.buttonText} className="button-text">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDashboard;