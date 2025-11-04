import React, { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Clock,
  HelpCircle,
  Info,
  BookOpen,
  Bookmark,
  Book,
  BookMarked,
  Play,
  Crown,
  PlayCircle,
} from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import logo from "../Images/LOGO.jpg";
import "bootstrap/dist/js/bootstrap.bundle.min";
import API_BASE_URL from "./ApiConfig";
import WelcomePopup from "./WelcomePopup";

const styles = `
  .dashboard-container {
    background-color: #f8f9fa;
    min-height: 100vh;
  }

  .professional-navbar {
    background-color: #1a3b5d;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .brand-logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .brand-text {
    color: #ffffff;
    font-size: 1.4rem;
    font-weight: 600;
    margin-left: 1rem;
  }

  .nav-item-link {
    color: rgba(255, 255, 255, 0.9) !important;
    display: flex !important;
    align-items: center;
    padding: 0.7rem 1rem !important;
    transition: all 0.2s;
    position: relative;
  }

  .nav-item-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .nav-icon {
    margin-right: 0.5rem;
  }

  .badge-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #dc3545;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .dashboard-title {
    color: #1a3b5d;
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .tutorial-link-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.8rem;
  }

  .tutorial-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.7rem 1.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
  }

  .tutorial-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .tutorial-link:hover::before {
    left: 100%;
  }

  .tutorial-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: underline;
  }

  .tutorial-icon {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .exam-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    height: 100%;
  }

  .exam-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .exam-card-header {
    background-color: #1a3b5d;
    color: white;
    padding: 1.25rem;
    border-radius: 8px 8px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .exam-card-header.expired {
    background-color: #6c757d;
  }

  .exam-card-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .status-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .status-badge.expired {
    background: rgba(220, 53, 69, 0.3);
  }

  .exam-card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-row {
    display: flex;
    align-items: center;
    color: #495057;
    gap: 0.8rem;
  }

  .info-icon {
    color: #1a3b5d;
  }

  .exam-details {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .detail-label {
    color: #6c757d;
    font-size: 0.85rem;
  }

  .detail-value {
    color: #212529;
    font-weight: 600;
  }

  .start-exam-btn {
    background-color: #1a3b5d;
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
    margin-top: auto;
    width: 100%;
  }

  .start-exam-btn:hover {
    background-color: #2d5175;
  }

  .start-exam-btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #dc3545;
  }

  .exam-status-message {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 0.8rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #856404;
  }

  .exam-status-message.expired {
    background-color: #f8d7da;
    border-left-color: #dc3545;
    color: #721c24;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 3rem;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .action-btn.primary {
    background-color: #1a3b5d;
    color: white;
    border: none;
  }

  .action-btn.secondary {
    background-color: #2d5175;
    color: white;
    border: none;
  }

  .action-btn.outline {
    background-color: transparent;
    border: 2px solid #1a3b5d;
    color: #1a3b5d;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .resource-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-top: 4px solid transparent;
  }

  .resource-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .resource-card.practice-tests {
    border-top-color: #4e73df;
  }

  .resource-card.study-materials {
    border-top-color: #1cc88a;
  }

  .resource-card.video-syllabus {
    border-top-color: #f6a623;
  }

  .resource-card.premium {
    border-top-color: #d4af37;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.03) 100%);
  }

  .resource-card-header {
    padding: 1.25rem;
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .resource-card-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .resource-icon {
    color: #4e73df;
  }

  .resource-card.study-materials .resource-icon {
    color: #1cc88a;
  }

  .resource-card.video-syllabus .resource-icon {
    color: #f6a623;
  }

  .resource-card.premium .resource-icon {
    color: #d4af37;
  }

  .resource-card-body {
    padding: 0 1.25rem 1.25rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .resource-card-body p {
    color: #4a5568;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    flex-grow: 1;
  }

  .premium-features {
    color: #2d3748;
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.4;
  }

  .premium-features span {
    color: #d4af37;
    font-weight: bold;
    margin-right: 0.3rem;
  }

  .resource-btn {
    background-color: #4e73df;
    color: white;
    border: none;
    padding: 0.6rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
    width: 100%;
    margin-top: auto;
  }

  .resource-card.study-materials .resource-btn {
    background-color: #1cc88a;
  }

  .resource-card.video-syllabus .resource-btn {
    background-color: #f6a623;
  }

  .resource-card.premium .resource-btn {
    background-color: #d4af37;
    color: #2d3748;
    font-weight: 600;
  }

  .resource-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .no-exam-message {
    text-align: center;
    color: #6c757d;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .navbar-toggler {
    margin-left: auto;
    border: none;
  }

  .navbar-toggler-icon {
    background-color: #fff;
    border-radius: 4px;
    padding: 4px;
  }

  .footer {
    background-color: #f8f9fa;
    padding: 1rem 0;
  }

  .footer-link {
    color: #1a3b5d;
    text-decoration: none;
  }

  .footer-link:hover {
    text-decoration: underline;
  }

  @media (max-width: 992px) {
    .resource-card {
      margin-bottom: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 0 10px;
      margin: 0;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .navbar-brand img {
      height: 30px;
      width: 30px;
    }

    .brand-text {
      font-size: 16px;
      white-space: nowrap;
    }

    .navbar-toggler {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      position: relative;
      z-index: 1;
    }

    .navbar-collapse {
      padding: 0.5rem;
      background-color: #1a3b5d;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .navbar-nav {
      gap: 0.5rem;
    }

    .nav-link {
      font-size: 14px;
      color: white !important;
    }

    .container-fluid {
      padding: 0;
      margin: 0;
      max-width: 100%;
    }

    .dashboard-title {
      font-size: 1.8rem;
    }

    .tutorial-link {
      font-size: 0.85rem;
      padding: 0.6rem 1.2rem;
    }
  }
`;

const Dashboard = () => {
  const [exam, setExam] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [temporarilyHidden, setTemporarilyHidden] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExamExpired, setIsExamExpired] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowPopup(true);
      localStorage.setItem("hasVisited", "true");
    }

    const clearLocalStorageOnClose = () => {
      localStorage.removeItem("hasVisited");
    };
    window.addEventListener("beforeunload", clearLocalStorageOnClose);

    return () => {
      window.removeEventListener("beforeunload", clearLocalStorageOnClose);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    const cleanup = setupSSEListener();
    if (location.pathname !== "/notifications") {
      setTemporarilyHidden(false);
    }
    return cleanup;
  }, [location]);

  useEffect(() => {
    const checkExamTime = () => {
      if (!exam) return;

      const now = new Date();
      const [endTime, period] = exam.endTime.split(' ');
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      let adjustedEndHours = endHours;
      if (period === 'PM' && endHours !== 12) {
        adjustedEndHours += 12;
      } else if (period === 'AM' && endHours === 12) {
        adjustedEndHours = 0;
      }

      const examEndTime = new Date();
      examEndTime.setHours(adjustedEndHours, endMinutes, 0, 0);

      if (now > examEndTime) {
        setIsExamExpired(true);
      } else {
        setIsExamExpired(false);
      }
    };

    checkExamTime();
    const interval = setInterval(checkExamTime, 60000);

    return () => clearInterval(interval);
  }, [exam]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`);
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const setupSSEListener = () => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/exams`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        const today = new Date().toISOString().split("T")[0];
        const todayExam = data.data.find((exam) => exam.date === today);
        setExam(todayExam || null);
      } else {
        console.error("Error in SSE data:", data.error);
        setExam(null);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Error with SSE connection:", error);
      eventSource.close();
    };

    return () => eventSource.close();
  };

  const handleNotificationClick = () => setTemporarilyHidden(true);
  const goToExamEntry = () => {
    if (isExamExpired) {
      alert("This exam has ended. You cannot start it anymore.");
      return;
    }
    navigate("/examentry");
  };
  const goToResults = () => navigate("/examresults");
  const goToSyllabus = () => navigate("/usersyllabus");
  const goToHallTicket = () => navigate("/downloadhallticket");
  const goToExamForm = () => navigate("/examform");
  const goToExamCheckAnswers = () => navigate("/checkanswers");
  const goToExamWinnersDashboard = () => navigate("/findwinner");
  const goToPracticeTests = () => navigate("/practicetestdashboard");
  const goToStudyMaterials = () => navigate("/pdfsyllabusdashboard");
  const goToUpgradeNow = () => navigate("/superuser");
  const goTovideoDashboard = () => navigate("/videosyllabusdashboard");
  const goToTutorialDashboard = () => navigate("/tutorialdashboard");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayCount = unreadCount > 3 ? "3+" : unreadCount;
  const shouldShowBadge = !temporarilyHidden && unreadCount > 0;

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <nav
          className="navbar navbar-expand-lg professional-navbar"
          style={{ height: "100px" }}
        >
          <div className="container-fluid px-3">
            <div className="d-flex align-items-center">
              <a className="navbar-brand d-flex align-items-center" href="#">
                <img
                  src={logo}
                  alt="Logo"
                  className="brand-logo"
                  style={{ height: "60px", width: "60px", padding: "5px" }}
                />
                <span className="brand-text ms-1" style={{ fontSize: "20px" }}>
                  ARN Pvt Exam Conduct
                </span>
              </a>
              <button
                className="navbar-toggler ms-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul
                className="navbar-nav ms-auto align-items-center"
                style={{ fontSize: "16px" }}
              >
                <NavItem
                  to="/practiceexamentry"
                  icon={<Book size={20} />}
                  text="My Practice Test"
                />
                <NavItem
                  to="/upcomingexams"
                  icon={<Calendar size={20} />}
                  text="Upcoming Exam"
                />
                <NavItem
                  to="/notifications"
                  icon={<Bell size={20} />}
                  text="Notifications"
                  badge={shouldShowBadge ? displayCount : null}
                  onClick={handleNotificationClick}
                />
                <NavItem
                  to="/examqa"
                  icon={<BookOpen size={20} />}
                  text="Exam Q/A"
                />
                <NavItem
                  to="/aboutus"
                  icon={<Info size={20} />}
                  text="About Us"
                />
                <NavItem to="/help" icon={<HelpCircle size={20} />} text="Help" />
              </ul>
            </div>
          </div>
        </nav>

        {showPopup && <WelcomePopup />}

        <div className="container main-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Exam Dashboard</h1>
            <div className="tutorial-link-container">
              <Link to="/tutorialdashboard" className="tutorial-link">
                <PlayCircle size={20} className="tutorial-icon" />
                <span>Don't know how to use website? Click to watch tutorials</span>
              </Link>
            </div>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-3 col-lg-3">
              <div className="resource-card practice-tests">
                <div className="resource-card-header">
                  <BookMarked size={24} className="resource-icon" />
                  <h3>Practice Tests</h3>
                </div>
                <div className="resource-card-body">
                  <p>
                    Access premium practice tests to prepare for your exams with real exam-like questions.
                  </p>
                  <button 
                    className="resource-btn" 
                    onClick={goToPracticeTests}
                  >
                    Explore Tests
                  </button>
                </div>
              </div>
            </div>

            {exam ? (
              <div className="col-12 col-md-6 col-lg-6">
                <div className="exam-card">
                  <div className={`exam-card-header ${isExamExpired ? 'expired' : ''}`}>
                    <h3>{exam.examDetails?.name || "Today's Exam"}</h3>
                    {isExamExpired && (
                      <span className="status-badge expired">ENDED</span>
                    )}
                  </div>
                  <div className="exam-card-body">
                    <div className="info-row">
                      <Calendar className="info-icon" size={20} />
                      <span>{exam.date}</span>
                    </div>
                    <div className="info-row">
                      <Clock className="info-icon" size={20} />
                      <span>
                        {exam.startTime} - {exam.endTime}
                      </span>
                    </div>
                    <div className="exam-details">
                      <div className="detail-item">
                        <span className="detail-label">Total Marks</span>
                        <span className="detail-value">{exam.marks}</span>
                      </div>
                    </div>
                    
                    <button 
                      className={`start-exam-btn ${isExamExpired ? 'disabled' : ''}`} 
                      onClick={goToExamEntry}
                      disabled={isExamExpired}
                    >
                      {isExamExpired ? "Exam is Over Today" : "Start Exam"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-12 col-md-6 col-lg-6">
                <div className="no-exam-message">
                  <p>No exams scheduled for today.</p>
                </div>
              </div>
            )}

            <div className="col-12 col-md-3 col-lg-3">
              <div className="resource-card study-materials">
                <div className="resource-card-header">
                  <Bookmark size={24} className="resource-icon" />
                  <h3>Study Materials</h3>
                </div>
                <div className="resource-card-body">
                  <p>
                    Comprehensive study guides, notes, and reference materials to help you ace your exams.
                  </p>
                  <button 
                    className="resource-btn" 
                    onClick={goToStudyMaterials}
                  >
                    Explore Materials
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3 col-lg-3">
              <div className="resource-card video-syllabus">
                <div className="resource-card-header">
                  <Play size={24} className="resource-icon" />
                  <h3>Video Syllabus</h3>
                </div>
                <div className="resource-card-body">
                  <p>
                    Watch comprehensive video lectures and tutorials from expert instructors covering complete syllabus.
                  </p>
                  <button 
                    className="resource-btn" 
                    onClick={goTovideoDashboard}
                  >
                    Explore Videos
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3 col-lg-3">
              <div className="resource-card premium">
                <div className="resource-card-header">
                  <Crown size={24} className="resource-icon" />
                  <h3>Super User Premium</h3>
                </div>
                <div className="resource-card-body">
                  <p className="premium-features">
                    <span>✓</span>Unlimited practice tests access. <span>✓</span>All video materials included. <span>✓</span>Priority support & assistance. <span>✓</span>Ad-free learning experience. Get complete access to all premium features!
                  </p>
                  <button 
                    className="resource-btn" 
                    onClick={goToUpgradeNow}
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <ActionButton color="primary" text="View Results" onClick={goToResults} />
            <ActionButton
              color="primary"
              text="Download Syllabus"
              onClick={goToSyllabus}
            />
            <ActionButton
              color="primary"
              text="Download Hall Ticket"
              onClick={goToHallTicket}
            />
            <ActionButton color="primary" text="Exam Form" onClick={goToExamForm} />
            <ActionButton color="primary" text="Exam Key Answers" onClick={goToExamCheckAnswers} />
            <ActionButton color="primary" text="Winner Dashboard" onClick={goToExamWinnersDashboard} />
          </div>
        </div>

        <footer className="footer mt-5 bg-light py-3">
          <div className="container text-center">
            <p className="mb-2">
              &copy; 2025/2026 Karnataka Ayan Wholesale Supply Enterprises. All Rights Reserved.
            </p>
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/termscondition" className="footer-link">Terms and Conditions</Link>
              </li>
              <li className="list-inline-item">|</li>
              <li className="list-inline-item">
                <Link to="/privacypolicy" className="footer-link">Privacy Policy</Link>
              </li>
              <li className="list-inline-item">|</li>
              <li className="list-inline-item">
                <Link to="/cancellationplicy" className="footer-link">Cancellation Policy</Link>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
};

const NavItem = ({ icon, text, badge, to, onClick }) => (
  <li className="nav-item">
    <Link to={to || "#"} className="nav-link nav-item-link" onClick={onClick}>
      <div className="nav-icon">{icon}</div>
      <span className="nav-text">{text}</span>
      {badge && <span className="badge-count">{badge}</span>}
    </Link>
  </li>
);

const ActionButton = ({ color, text, onClick }) => (
  <button className={`action-btn ${color}`} onClick={onClick}>
    {text}
  </button>
);

export default Dashboard;