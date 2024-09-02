import React, { useState, useEffect } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header = ({ onLogout, isLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleLogout = () => {
        onLogout();
    };

    const handleMouseEnter = () => {
        setDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        setDropdownOpen(false);
    };

    return (
        <header className="header-container">
            <div className="header-title">
                VibeCart
            </div>

            <div className="header-subtitle">
                Offer Management System
            </div>

            <div className="header-actions">
                {isLoggedIn && (
                    <div 
                        className="user-info" 
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        style={{display:"flex", flexDirection:"column"}}
                    >
                        <FaUser className="user-icon" />
                        <span className="user-name">{username}</span>
                        <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                            <a href="#" className="dropdown-item">Your Profile</a>
                            <a href="#" className="dropdown-item">Settings</a>
                            <a href="#" className="dropdown-item" onClick={handleLogout}>Sign out</a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
