import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from './components/Redux/authSlice';
import Login from './components/Login/Login';
import Dashboard from './components/dashboard/Dashboard';
import CreateOffers from './components/Offers/CreateOffers';
import UpdateOffers from './components/Offers/UpdateOffers';
import DeleteOffers from './components/Offers/DeleteOffers';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css'; 

const App = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const handleLogin = () => {
    dispatch(login());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className='app-container'>
      <Router>
        <Header onLogout={handleLogout} isLoggedIn={isLoggedIn} />
        <div className='content-container'>
          {isLoggedIn ? (
            <>
              <Sidebar className='sidebar' />
              <div className='main-content'>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/createOffers" element={<CreateOffers />} />
                  <Route path="/updateOffers" element={<UpdateOffers />} />
                  <Route path="/deleteOffers" element={<DeleteOffers />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
