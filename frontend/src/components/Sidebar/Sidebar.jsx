import React from "react";
import "./Sidebar.scss";
import {
  FiGrid,
  FiUsers,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiBook,
  FiMessageSquare,
  FiSettings,
} from "react-icons/fi";
import { BiBuilding } from "react-icons/bi";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"></div>
        <span>HR System</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item active">
          <FiGrid className="nav-icon" />
          <span>Dashboard</span>
        </div>
        <div className="nav-item">
          <BiBuilding className="nav-icon" />
          <span>Department</span>
          <span className="arrow">›</span>
        </div>
        <div className="nav-item">
          <FiUsers className="nav-icon" />
          <span>Employee</span>
        </div>
        <div className="nav-item">
          <FiClock className="nav-icon" />
          <span>Attendance</span>
        </div>
        <div className="nav-item">
          <FiDollarSign className="nav-icon" />
          <span>Salary</span>
        </div>
        <div className="nav-item">
          <FiFileText className="nav-icon" />
          <span>Report</span>
          <span className="badge">14</span>
        </div>

        <div className="nav-section-title">Others</div>

        <div className="nav-item">
          <FiBook className="nav-icon" />
          <span>Guide</span>
          <span className="arrow">›</span>
        </div>
        <div className="nav-item">
          <FiMessageSquare className="nav-icon" />
          <span>Messenger</span>
          <span className="badge red">New!</span>
        </div>
        <div className="nav-item">
          <FiSettings className="nav-icon" />
          <span>Settings</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
