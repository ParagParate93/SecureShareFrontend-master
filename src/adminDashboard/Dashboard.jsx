
import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome to Admin Dashboard</h2>

      <div className="dashboard-options">
        <div className="dashboard-card me-3">
          <Link to="/UserManagement" className="dashboard-link">
            <i className="fas fa-users dashboard-icon"></i>
            <span>Manage Users</span>
          </Link>
        </div>
        <div className="dashboard-card">
          <Link to="/DocumentManagement" className="dashboard-link">
            <i className="fas fa-file-alt dashboard-icon"></i>
            <span>Manage Documents</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-image-container">
        <img
          src="src/adminDashboard/dashboardpic.jpeg"
          alt="Dashboard"
          className="dashboard-image"
        />
      </div>
      <footer className="user-dashboard-footer">

        <p>&copy; 2024 TrustVault. All rights reserved.</p>

      </footer>
    </div>
  );
}

export default Dashboard;
