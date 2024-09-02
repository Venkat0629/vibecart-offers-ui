import React from "react";
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; 

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-item">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Dashboard
        </NavLink>
      </div>
      <div className="sidebar-item">
        <NavLink to="/createOffers" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Create Offers
        </NavLink>
      </div>
      <div className="sidebar-item">
        <NavLink to="/updateOffers" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Update Offers
        </NavLink>
      </div>
      <div className="sidebar-item">
        <NavLink to="/deleteOffers" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Delete Offers
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
