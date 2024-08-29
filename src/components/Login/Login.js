import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../Redux/authSlice';
import './Login.css';

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

        const token = response.data.message; // Extract the token from the message field
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
    <div className="d-flex flex-column justify-content-end align-items-center loginform">
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <div className="mb-3">
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
          {errors.auth && <div className="error-message">{errors.auth}</div>}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
