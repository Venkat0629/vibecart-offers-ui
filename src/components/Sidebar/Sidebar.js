import React from "react";
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; 

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-item">
        <NavLink to="/dashboard" activeClassName="active-link">Dashboard</NavLink>
      </div>
      <div className="sidebar-item">
        <NavLink to="/createOffers" activeClassName="active-link">Create Offers</NavLink>
      </div>
      <div className="sidebar-item">
        <NavLink to="/updateOffers" activeClassName="active-link">Update Offers</NavLink>
      </div>
      <div className="sidebar-item">
        <NavLink to="/deleteOffers" activeClassName="active-link">Delete Offers</NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
