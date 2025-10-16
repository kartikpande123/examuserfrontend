import React, { useState } from 'react';
import {
  Plus,
  ListPlus,
  FileText,
  ArrowLeft,Users
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";

const AdminPdfSyllabusDashboard = () => {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();

  const dashboardButtons = [
    { id: 1, title: 'Add Syllabus Category', icon: <ListPlus size={24} color="#4CAF50" />, bgColor: '#e8f5e9', hoverBgColor: '#d7eddb' },
    { id: 2, title: 'Add Syllabus Details', icon: <FileText size={24} color="#2196F3" />, bgColor: '#e3f2fd', hoverBgColor: '#d4e9f7' },
    { id: 3, title: 'PDF Syllabus Purchasers', icon: <Plus size={24} color="#FF9800" />, bgColor: '#fff3e0', hoverBgColor: '#ffe8cc' },
  ];

  const handleButtonClick = (id, title) => {
    setActiveButton(id);
    console.log(`Button clicked: ${title}`);
    switch (id) {
      case 1:
        navigate("/pdfcategory");
        break;
      case 2:
        navigate("/pdfdetails");
        break;
      case 3:
        navigate("/pdfpurchasers");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="dashboard-container">
      {/* Enhanced Navbar with improved gradient and visual elements */}
      <nav className="navbar navbar-expand-lg" style={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
        padding: '15px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '400px',
          height: '100%',
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: -20,
          left: 100,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1
        }}></div>
        
        <div className="container d-flex justify-content-between align-items-center">
          {/* Left section with enhanced back button and title */}
          <div className="navbar-brand d-flex align-items-center">
            <button 
              onClick={handleBack}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <ArrowLeft size={30} color="white" />
            </button>
            <div style={{
              borderLeft: '3px solid rgba(255,255,255,0.9)',
              paddingLeft: '18px',
              height: '45px'
            }}>
              <span style={{ 
                color: 'white', 
                fontWeight: '600', 
                fontSize: '1.5rem',
                lineHeight: '1.2',
                display: 'block',
                letterSpacing: '0.5px'
              }}>
                ARN Private
              </span>
              <span style={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                PDf Syllabus Portal
              </span>
            </div>
          </div>
          
          {/* Middle section with enhanced dashboard title */}
          <div className="d-flex align-items-center justify-content-center position-relative" style={{
            padding: '8px 30px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h1 style={{ 
              color: 'white', 
              fontWeight: '700',
              fontSize: '2.2rem',
              margin: '0',
              textShadow: '1px 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '2px'
            }}>
              PDF Syllabus DASHBOARD
            </h1>
          </div>
          
          {/* Empty div for balance (removed icons) */}
          <div style={{ width: '150px' }}></div>
        </div>
      </nav>

      {/* Main Content with enhanced card design */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        minHeight: 'calc(100vh - 80px)', 
        padding: '40px 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className="container">
          <div className="row g-4">
            {dashboardButtons.map((button) => (
              <div key={button.id} className="col-md-4">
                <div 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '35px 25px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeButton === button.id 
                      ? '0 10px 20px rgba(0,0,0,0.1), 0 0 0 3px ' + button.bgColor
                      : '0 5px 15px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    transform: activeButton === button.id ? 'translateY(-5px)' : 'translateY(0)',
                    border: '1px solid ' + (activeButton === button.id ? button.bgColor : 'rgba(0,0,0,0.03)')
                  }}
                  onClick={() => handleButtonClick(button.id, button.title)}
                  onMouseOver={(e) => {
                    if (activeButton !== button.id) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeButton !== button.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
                    }
                  }}
                >
                  <div style={{
                    backgroundColor: button.bgColor,
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '25px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}>
                    {button.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#333',
                    textAlign: 'center'
                  }}>
                    {button.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPdfSyllabusDashboard;