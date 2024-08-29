import React, { useState, useEffect } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header = ({ onLogout, isLoggedIn }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUsername(''); // Clear the username from state
        if (onLogout) {
            onLogout(); // Call the onLogout function passed as a prop
        }
    };

    return (
        <header className="header-container d-flex justify-content-between align-items-center p-3 shadow">
            <div className="header-title">
                VibeCart
            </div>

            <div className="header-subtitle">
                Offer Management System
            </div>

            <div className="d-flex align-items-center header-icons">
                <div className="user-info d-flex flex-column align-items-center">
                    <FaUser className="user-icon" />
                    <span className="user-name">My Account</span>
                </div>
                <div>
                    {isLoggedIn && (
                        <button onClick={handleLogout} className="logout-button">
                            <FaSignOutAlt className="logout-icon" /><span className='logout-btn'>Logout</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
