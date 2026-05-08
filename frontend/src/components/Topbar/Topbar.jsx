import React from "react";
import "./Topbar.scss";
import { FiMenu, FiSearch, FiBell, FiMail, FiCoffee } from "react-icons/fi";

const Topbar = () => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="menu-btn">
          <FiMenu />
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <input type="text" placeholder="Search here..." />
          <FiSearch className="search-icon" />
        </div>

        <div className="actions">
          <div className="action-icon">
            <FiBell />
            <span className="badge blue">23</span>
          </div>
          <div className="action-icon">
            <FiMail />
            <span className="badge green">68</span>
          </div>
          <div className="action-icon">
            <FiCoffee />
            <span className="badge gray">14</span>
          </div>
        </div>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Designluch</span>
            <span className="user-role">Super Admin</span>
          </div>
          <div className="user-avatar">
            {/* Using a placeholder avatar image or icon */}
            <img src="https://ui-avatars.com/api/?name=Designluch&background=random" alt="Avatar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
