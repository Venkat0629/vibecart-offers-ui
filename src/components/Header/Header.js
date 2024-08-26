import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import './Header.css';

const Header = ({ isLoggedIn, onLogout }) => {
    const [showLogout, setShowLogout] = useState(false);

    const handleUserClick = () => {
        setShowLogout(prevShowLogout => !prevShowLogout);
    };

    return (
        <header className="header-container d-flex justify-content-between align-items-center p-3 shadow">
            <div className="header-title">
                VibeCart
            </div>

            <div className="header-subtitle">
                Offer Management System
            </div>

            <div className="d-flex align-items-center">
                <div className="user-info d-flex flex-column align-items-center" onClick={handleUserClick}>
                    <FaUser className="user-icon" />
                    <span className="user-name">My Account</span>
                    {isLoggedIn && showLogout && (
                        <div className="logout-menu">
                            <span className="logout" onClick={onLogout}>Logout</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
