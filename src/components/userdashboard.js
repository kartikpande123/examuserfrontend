import React, { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Clock,
  HelpCircle,
  Info,
  BookOpen,
} from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../Images/LOGO.jpg";
import "bootstrap/dist/js/bootstrap.bundle.min";
import API_BASE_URL from "./ApiConifg";
import WelcomePopup from "./WelcomePopup";

const Dashboard = () => {
  const [exam, setExam] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [temporarilyHidden, setTemporarilyHidden] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Added state for popup
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
  const goToExamEntry = () => navigate("/examentry");
  const goToResults = () => navigate("/examresults");
  const goToSyllabus = () => navigate("/syllabus");
  const goToHallTicket = () => navigate("/downloadhallticket");
  const goToExamForm = () => navigate("/examform");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayCount = unreadCount > 3 ? "3+" : unreadCount;
  const shouldShowBadge = !temporarilyHidden && unreadCount > 0;

  return (
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
        <h1 className="dashboard-title">Exam Dashboard</h1>

        <div className="row g-4 justify-content-center">
          {exam ? (
            <div className="col-12 col-md-6 col-lg-6">
              <div className="exam-card">
                <div className="exam-card-header">
                  <h3>{exam.examDetails?.name || "Today's Exam"}</h3>
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
                  <button className="start-exam-btn" onClick={goToExamEntry}>
                    Start Exam
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-12">
              <p className="no-exam-message">No exams scheduled for today.</p>
            </div>
          )}
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
        </div>
      </div>

      {/* Footer */}
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
