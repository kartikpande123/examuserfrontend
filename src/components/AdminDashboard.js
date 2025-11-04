import React, { useState } from 'react';
import {
  BookOpen,
  LogOut,
  Plus,
  Calendar,
  Bell,
  FileText,
  Award,
  Users,
  HelpCircle,
  Trophy,
  Clock,
  Book,
  CreditCard,
  Video,
  Superscript,
  VideoIcon,
  VideoOff,
  School
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import logoImg from "../Images/LOGO.jpg";

const styles = `
  .admin-dashboard-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  }

  .admin-custom-navbar {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 1.2rem 0;
  }

  .admin-brand-logo {
    width: 50px;
    height: 50px;
    border-radius: 10px;
  }

  .admin-brand-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .admin-dashboard-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: white;
  }

  .admin-logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    color: #1e3c72;
    border: 2px solid white;
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .admin-logout-btn:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .admin-dashboard-button {
    position: relative;
    width: 100%;
    height: 160px;
    background: white;
    border: none;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .admin-dashboard-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .admin-dashboard-button.admin-active {
    border: 2px solid var(--admin-button-color);
  }

  .admin-button-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
  }

  .admin-icon-container {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    background: rgba(var(--admin-button-color-rgb), 0.1);
    transition: all 0.3s ease;
  }

  .admin-dashboard-button:hover .admin-icon-container {
    transform: scale(1.1);
    background: rgba(var(--admin-button-color-rgb), 0.2);
  }

  .admin-button-title {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  .admin-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, transparent 0%, var(--admin-button-color) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  .admin-dashboard-button:hover .admin-hover-effect {
    opacity: 0.05;
  }

  .admin-active-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 15px;
    border: 2px solid var(--admin-button-color);
    animation: admin-pulse-border 1.5s ease-out infinite;
  }

  .admin-logout-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(5px);
  }

  .admin-logout-popup {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 400px;
    width: 90%;
  }

  .admin-logout-popup h3 {
    margin-bottom: 1.5rem;
    color: #333;
    font-weight: 600;
  }

  .admin-popup-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .admin-popup-buttons .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .admin-popup-buttons .btn-danger {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .admin-popup-buttons .btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
  }

  .admin-popup-buttons .btn-secondary {
    background: #6c757d;
  }

  .admin-popup-buttons .btn-secondary:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }

  @keyframes admin-pulse-border {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes admin-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
    }
  }

  @media (max-width: 768px) {
    .admin-dashboard-title {
      font-size: 1.2rem;
      margin-right: 0 !important;
    }

    .admin-brand-text {
      font-size: 1.2rem;
    }

    .admin-dashboard-button {
      height: 140px;
    }

    .admin-logout-btn {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
  }
`;

const specialButtonStyles = {
  specialButton: {
    background: 'linear-gradient(135deg, #4285F4, #34A853)',
    border: '1px solid #4285F4',
    boxShadow: '0 4px 8px rgba(66, 133, 244, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  },
  specialButtonHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(66, 133, 244, 0.25)',
  },
  specialContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 0',
  },
  specialIconContainer: {
    background: 'rgba(255, 255, 255, 0.3)',
    padding: '10px',
    borderRadius: '50%',
    color: 'white',
    marginBottom: '8px',
  },
  specialTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    textAlign: 'center',
    lineHeight: '1.3',
  },
  newBadge: {
    backgroundColor: '#FBBC05',
    color: '#202124',
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '12px',
    marginLeft: '6px',
    position: 'relative',
    top: '-2px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pulsingDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    backgroundColor: '#FBBC05',
    borderRadius: '50%',
    animation: 'admin-pulse 2s infinite',
  },
};

const AdminDashboard = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setShowLogoutPopup(false);
    navigate("/");
  };

  const dashboardButtons = [
    { id: 1, title: 'Add Question', icon: <Plus size={24} />, color: '#4CAF50' },
    { id: 2, title: 'Add Date & Time', icon: <Calendar size={24} />, color: '#2196F3' },
    { id: 3, title: 'Notification', icon: <Bell size={24} />, color: '#FF9800' },
    { id: 4, title: 'Upload Syllabus', icon: <FileText size={24} />, color: '#9C27B0' },
    { id: 5, title: 'Results', icon: <Award size={24} />, color: '#E91E63' },
    { id: 6, title: 'Candidates', icon: <Users size={24} />, color: '#00BCD4' },
    { id: 7, title: 'Candidates(No Photo)', icon: <Users size={24} />, color: '#00BCD4' },
    { id: 8, title: 'Queries', icon: <HelpCircle size={24} />, color: '#F44336' },
    { id: 9, title: 'Upload Key-Answers', icon: <BookOpen size={24}/>, color: '#795548' },
    { id: 10, title: 'Winner Details', icon: <Trophy size={24}/>, color: '#607D8B' },
    { id: 11, title: 'Practice Test Details', icon: <Clock size={24}/>, color: '#3949AB', special: true },
    { id: 12, title: 'PDF Syllabus Details', icon: <Book size={24}/>, color: '#3949AB', special: true },
    { id: 13, title: 'Video Syllabus details', icon: <Video size={24}/>, color: '#3949AB', special: true },
    { id: 14, title: 'GST Invoice Download', icon: <CreditCard size={24}/>, color: '#3949AB', special: true },
    { id: 15, title: 'Super User Details', icon: <Superscript size={24}/>, color: '#3949AB', special: true },
    { id: 16, title: 'Add Tutorial Videos', icon: <School size={24}/>, color: '#3949AB', special: true },
  ];

  const handleButtonClick = (id, title) => {
    setActiveButton(id);
    console.log(`Button clicked: ${title}`);
    switch (id) {
      case 1:
        navigate("/questions");
        break;
      case 2:
        navigate("/datentime");
        break;
      case 3:
        navigate("/adminnotification");
        break;
      case 4:
        navigate("/adminsyllabus");
        break;
      case 5:
        navigate("/adminexamresults");
        break;
      case 6:
        navigate("/candidates");
        break;
      case 7:
        navigate("/candidatesnophoto");
        break;
      case 8:
        navigate("/concirns");
        break;
      case 9:
        navigate("/uploadqa");
        break;
      case 10:
        navigate("/winnerdetails");
        break;
      case 11:
        navigate("/practicedashboard");
        break;
      case 12:
        navigate("/adminpdfSyllabusdashboard");
        break;
      case 13:
        navigate("/adminvideodashboard");
        break;
      case 14:
        navigate("/gstinvoice");
        break;
      case 15:
        navigate("/adminsuperuserdashboard");
        break;
      case 16:
        navigate("/adminaddtut");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-dashboard-container">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg admin-custom-navbar">
          <div className="container">
            <div className="navbar-brand d-flex align-items-center gap-3">
              <img src={logoImg} alt="Logo" className="admin-brand-logo" style={{height:"70px", width:"70px"}} />
              <span className="admin-brand-text">ARN Private <br/><span>Exam Conduct</span></span>
            </div>
            <span className="admin-dashboard-title" style={{marginRight:"100px"}}>Admin Dashboard</span>
            <button className="admin-logout-btn" onClick={() => setShowLogoutPopup(true)}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container py-5">
          <div className="row g-4">
            {dashboardButtons.map((button) => (
              <div key={button.id} className="col-12 col-md-6 col-lg-3">
                <button
                  className={`admin-dashboard-button ${activeButton === button.id ? 'admin-active' : ''}`}
                  style={{ 
                    '--admin-button-color': button.color,
                    ...(button.special && {
                      ...specialButtonStyles.specialButton,
                      ...(hoveredButton === button.id && specialButtonStyles.specialButtonHover)
                    })
                  }}
                  onClick={() => handleButtonClick(button.id, button.title)}
                  onMouseEnter={() => setHoveredButton(button.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {button.special && <div style={specialButtonStyles.pulsingDot}></div>}
                  
                  <div className="admin-button-content" style={button.special ? specialButtonStyles.specialContent : {}}>
                    <div className="admin-icon-container" style={button.special ? specialButtonStyles.specialIconContainer : { color: button.color }}>
                      {button.icon}
                    </div>
                    <span className="admin-button-title" style={button.special ? specialButtonStyles.specialTitle : {}}>
                      {button.title}
                      {button.special && <span style={specialButtonStyles.newBadge}>NEW</span>}
                    </span>
                  </div>
                  
                  <div className="admin-hover-effect" style={button.special ? { background: 'rgba(255, 255, 255, 0.3)' } : {}}></div>
                  {activeButton === button.id && <div className="admin-active-pulse"></div>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Confirmation Popup */}
        {showLogoutPopup && (
          <div className="admin-logout-popup-overlay">
            <div className="admin-logout-popup">
              <h3>Are you sure you want to logout?</h3>
              <div className="admin-popup-buttons">
                <button className="btn btn-danger" onClick={handleLogout}>
                  Yes, Logout
                </button>
                <button className="btn btn-secondary" onClick={() => setShowLogoutPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;