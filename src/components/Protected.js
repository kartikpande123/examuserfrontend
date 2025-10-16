import React from "react";
import { Navigate } from "react-router-dom";

const Protected = ({ Component }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"; // Check authentication

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // Redirect to login if not authenticated
  }

  return <Component />; // Render protected component
};

export default Protected;
