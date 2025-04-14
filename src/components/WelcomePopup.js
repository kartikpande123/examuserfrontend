import React, { useState, useEffect } from "react";
import { Trophy, Award, Gift, Phone, Bell, Star } from "lucide-react";

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const prizeData = {
    first: {
      worth: 1000,
      icon: <Trophy className="text-warning" style={{ fontSize: "2rem" }} />,
      items: [
        { name: "Comport", mrp: 57 },
        { name: "Harpic", mrp: 105 },
        { name: "Phynail", mrp: 75 },
        { name: "Lizol", mrp: 140 },
        { name: "Soap wheel (10pcs)", mrp: 100 },
        { name: "Raw rice (1kg)", mrp: 75 },
        { name: "Santoor soap (2pcs)", mrp: 70 },
        { name: "Sugar (2kg)", mrp: 84 },
        { name: "Ghee", mrp: 140 },
        { name: "Ice cream", mrp: 49 },
        { name: "Besan (0.5kg)", mrp: 65 },
        { name: "Paneer", mrp: 40 },
      ],
      cashOption: "₹1000",
    },
    second: {
      worth: 750,
      icon: <Award className="text-secondary" style={{ fontSize: "2rem" }} />,
      items: [
        { name: "Comport", mrp: 57 },
        { name: "Harpic", mrp: 105 },
        { name: "Phynail", mrp: 75 },
        { name: "Lizol", mrp: 140 },
        { name: "Soap (10pcs)", mrp: 100 },
        { name: "Paneer", mrp: 40 },
        { name: "Ice cream", mrp: 49 },
        { name: "Ghee", mrp: 140 },
        { name: "Idli rava", mrp: 44 },
      ],
      cashOption: "₹750",
    },
    third: {
      worth: 500,
      icon: <Gift className="text-warning" style={{ fontSize: "2rem" }} />,
      items: [
        { name: "Comport", mrp: 57 },
        { name: "Harpic", mrp: 105 },
        { name: "Phynail", mrp: 65 },
        { name: "Paneer", mrp: 40 },
        { name: "Ice cream", mrp: 49 },
        { name: "Ghee", mrp: 140 },
        { name: "Idli rava", mrp: 44 },
      ],
      cashOption: "₹500",
    },
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal d-flex align-items-center justify-content-center show fade"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white">
            <h2 className="modal-title">Karnataka Ayan Wholesale Supply Enterprises</h2>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          {/* Helpline at top */}
          <div className="bg-warning p-3 text-center mt-4 rounded">
            <div className="d-flex align-items-center justify-content-center">
              <Phone className="me-2" size={24} />
              <h4 className="m-0">
                <strong>Need Help? Call Our Helpline: </strong>
                <span className="text-danger">+91 6360785195</span>
              </h4>
            </div>
            <p className="mb-0 mt-1">Our experts are available to answer all your queries!</p>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {/* Special Announcement */}
            <div className="card border-danger mb-4">
              <div className="card-header bg-danger text-white d-flex align-items-center">
                <Bell className="me-2" size={24} />
                <h3 className="m-0">SPECIAL ANNOUNCEMENT</h3>
              </div>
              <div className="card-body bg-light">
                <div className="text-center mb-3">
                  <h2 className="text-danger">
                    <Star className="me-1" size={28} />
                    <span>FREE! FREE! FREE!</span>
                    <Star className="ms-1" size={28} />
                  </h2>
                </div>
                <h4 className="text-center text-success mb-3">Limited Time Offer - This Month Only!</h4>
                <p className="lead text-center">
                  Access all our <strong>Practice Tests</strong> and <strong>Complete Syllabus</strong> at absolutely NO COST!
                </p>
                <p className="text-center">
                  Enhance your skills with our professionally designed test series and comprehensive study materials.
                  Prepare like a pro and ace your competitive exams with our expert-curated content.
                </p>
                <div className="bg-warning p-2 text-center rounded">
                  <h5 className="mb-0">HURRY UP! This exceptional opportunity ends soon!</h5>
                </div>
              </div>
            </div>

            {/* Welcome Text */}
            <p className="text-secondary">
              Welcome to <strong>Karnataka Ayan Wholesale Supply Enterprises</strong>. With the support of our main company, we created our sub-company, <strong>ARN Pvt Exam Conduct</strong>, which runs competitive exams to nurture bright futures. The top 3 winners will be rewarded with premium grocery and dairy products or equivalent cash prizes!
            </p>

            {/* Prize Data Section */}
            {Object.entries(prizeData).map(([place, data], index) => (
              <div key={place} className="card my-3">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">{data.icon}</div>
                    <div>
                      <h4 className="card-title text-primary">
                        {index === 0
                          ? "First Prize"
                          : index === 1
                            ? "Second Prize"
                            : "Third Prize"}
                      </h4>
                      <p className="card-text text-secondary">
                        Worth ₹{data.worth}
                      </p>
                    </div>
                  </div>
                  <ul className="list-group">
                    {data.items.map((item, i) => (
                      <li key={i} className="list-group-item">
                        {item.name} - ₹{item.mrp}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-success">
                    Alternatively, you can choose a cash prize of {data.cashOption}.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Button */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleClose}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
