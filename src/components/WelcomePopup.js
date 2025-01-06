import React, { useState, useEffect } from "react";
import { Trophy, Award, Gift } from "lucide-react";

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
          <div className="modal-header bg-primary text-white">
            <h2 className="modal-title">Karnataka Ayan Wholesale Supply Enterprises</h2>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <p className="text-secondary">
              Welcome to <strong>Karnataka Ayan Wholesale Supply Enterprises</strong>. With the support of our main company, we created our sub-company, <strong>ARN Pvt Exam Conduct</strong>, which runs competitive exams to nurture bright futures. The top 3 winners will be rewarded with premium grocery and dairy products or equivalent cash prizes!
            </p>
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
