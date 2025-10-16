import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {useNavigate} from "react-router-dom"
import API_BASE_URL from './ApiConfig';

const AdminLogin = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/login?userid=${userId}&password=${password}`
      );
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("isAuthenticated", "true"); // Set authentication flag
        setErrorMessage("");
        navigate("/admindashboard"); // Redirect to dashboard
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };
  
  
  
  

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: "linear-gradient(to bottom right, #f7f9fc, #eaeef3)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        className="card p-4 shadow"
        style={{
          width: "25rem",
          borderRadius: "12px",
          background: "#ffffff",
          border: "1px solid #d1d9e6",
        }}
      >
        <h3
          className="text-center mb-4"
          style={{
            color: "#4a90e2",
            fontWeight: "bold",
          }}
        >
          Admin Login
        </h3>
        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label
              htmlFor="userId"
              className="form-label"
              style={{ fontWeight: "500", color: "#5a5a5a" }}
            >
              User ID
            </label>
            <input
              type="text"
              id="userId"
              className="form-control"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              style={{
                borderRadius: "8px",
                border: "1px solid #d1d9e6",
              }}
            />
          </div>
          <div className="form-group mb-4">
            <label
              htmlFor="password"
              className="form-label"
              style={{ fontWeight: "500", color: "#5a5a5a" }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                borderRadius: "8px",
                border: "1px solid #d1d9e6",
              }}
            />
          </div>
          {errorMessage && (
            <div
              className="alert alert-danger mb-3"
              role="alert"
              style={{
                backgroundColor: "#fdecea",
                color: "#d9534f",
                fontWeight: "500",
              }}
            >
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: "#4a90e2",
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
