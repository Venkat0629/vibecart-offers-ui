import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../Redux/authSlice';
import './Login.css'; // Ensure this file includes your custom styles

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'ROLE_ADMIN',
  });
  const [errors, setErrors] = useState({ username: '', password: '', auth: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!formData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: '', password: '', auth: '' });
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5501/vibe-cart/offers/login', {
          username: formData.username,
          password: formData.password,
        });

        const token = response.data.message; 
        const { username } = formData;
        localStorage.setItem('token', token); 
        localStorage.setItem('username', username); 
        dispatch(login()); // Dispatch login action
        navigate('/dashboard'); // Redirect to dashboard
      } catch (error) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          auth: 'Invalid username or password',
        }));
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'error-highlight' : ''}`}
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'error-highlight' : ''}`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="role" className="form-label">User Role</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
              <option value="master">Master</option>
            </select>
          </div>
          <button type="submit" className="login-button">Login</button>
          {errors.auth && <div className="error-message">{errors.auth}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
