import React from 'react';
import { Home, Video, Clipboard } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../Images/LOGO.jpg';

const CourseHeader = ({ navigate }) => {
  const handleHomeClick = () => {
    if (navigate) {
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg professional-navbar">
      <style>{`
        .professional-navbar {
          background: linear-gradient(135deg, #1a3b5d 0%, #244966 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 1040;
          height: 110px;
          border-bottom: 3px solid rgba(255, 255, 255, 0.1);
        }

        .brand-logo {
          width: 70px;
          height: 70px;
          border-radius: 12px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }

        .brand-logo:hover {
          transform: scale(1.05);
        }

        .brand-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-left: 0.75rem;
        }

        .brand-text {
          color: #ffffff;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0.3px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .brand-subtext {
          color: rgba(255, 255, 255, 0.85);
          font-size: 13px;
          font-weight: 500;
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0.5px;
        }

        .nav-item-link {
          color: rgba(255, 255, 255, 0.9) !important;
          display: flex !important;
          align-items: center;
          padding: 0.75rem 1.25rem !important;
          transition: all 0.3s ease;
          font-size: 16px;
          font-weight: 500;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          margin: 10px;
          cursor: pointer;
          text-decoration: none;
        }

        .nav-item-link:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .nav-icon {
          margin-right: 0.6rem;
        }

        .navbar-toggler {
          margin-left: auto;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
        }

        .navbar-toggler:focus {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .navbar-toggler-icon {
          filter: brightness(0) invert(1);
        }

        .navbar-collapse.show {
          background: linear-gradient(135deg, #1a3b5d 0%, #244966 100%);
          border-radius: 12px;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        @media (max-width: 991px) {
          .navbar-collapse {
            padding: 1rem;
          }
          
          .navbar-nav {
            gap: 0.75rem;
          }
          
          .navbar-nav .nav-item {
            width: 100%;
          }
          
          .nav-item-link {
            padding: 0.875rem 1rem !important;
            border-radius: 8px;
          }
        }

        @media (max-width: 768px) {
          .professional-navbar {
            height: auto;
            padding: 0.75rem 0.5rem !important;
          }

          .navbar-brand {
            gap: 8px;
          }

          .brand-logo {
            height: 50px;
            width: 50px;
          }

          .brand-text {
            font-size: 17px;
          }

          .brand-subtext {
            font-size: 11px;
          }

          .navbar-collapse {
            padding: 0.75rem;
            border-radius: 10px;
            margin-top: 0.75rem;
          }

          .nav-item-link {
            font-size: 14px;
          }
        }
        
        @media (max-width: 576px) {
          .brand-text {
            font-size: 15px;
          }

          .brand-subtext {
            font-size: 10px;
          }
        }
      `}</style>
      
      <div className="container-fluid px-3">
        <div className="d-flex align-items-center">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img 
              src={logo} 
              alt="Logo" 
              className="brand-logo"
            />
            <div className="brand-content">
              <span className="brand-text">ARN Pvt Exam Conduct</span>
              <span className="brand-subtext">Online Course Dashboard</span>
            </div>
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
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <a 
                onClick={handleHomeClick}
                className="nav-link nav-item-link"
                style={{cursor: 'pointer'}}
              >
                <Home size={20} className="nav-icon" />
                <span>Home</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="coursegmeetfinder" className="nav-link nav-item-link">
                <Video size={20} className="nav-icon" />
                <span>G-Meet</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="coursestatuscheck" className="nav-link nav-item-link">
                <Clipboard size={20} className="nav-icon" />
                <span>Track Admission</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default CourseHeader;