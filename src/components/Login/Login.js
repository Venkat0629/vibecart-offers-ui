import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../Redux/authSlice';
import './Login.css'; // Ensure this file includes your custom styles

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [errors, setErrors] = useState({ email: '', password: '', auth: '' });
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
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
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
    setErrors({ email: '', password: '', auth: '' });
    console.log(formData)
    if (validateForm()) {
      try {
        // Validate user credentials using email and password
        const response = await axios.post('http://localhost:6601/api/v1/vibe-cart/accounts/validate?type=user',formData);

        // Store the email in localStorage
        localStorage.setItem('email', formData.email);
        dispatch(login()); // Update auth state in Redux
        navigate('/dashboard'); // Navigate to the dashboard
      } catch (error) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          auth: 'Invalid email or password', // Display an error message if validation fails
        }));
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center max-vh-100">
    <div className="card" style={{ width: '28rem' }}>
      <div className="card-header text-center">
        <h2 className="login-title">Login</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="form-group mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <div className="form-group mb-3">
            <label htmlFor="role" className="form-label">User Role</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="GUEST">GUEST</option>
            </select>
          </div>
          <button type="submit" className="btn  w-100">Login</button>
          {errors.auth && <div className="text-danger text-center mt-2">{errors.auth}</div>}
        </form>
      </div>
    </div>
  </div>
  
  );
};

export default Login;
