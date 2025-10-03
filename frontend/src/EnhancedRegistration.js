import React, { useState } from 'react';
import './EnhancedRegistration.css'; // Use a separate CSS file for styling

const EnhancedRegistration = ({ onBackToLogin, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    // Student specific fields
    studentNumber: '',
    fullName: '',
    phone: '',
    department: 'FICT - Faculty of Information and Communication Technology',
    yearOfStudy: 1,
    // Lecturer specific fields
    employeeId: '',
    qualification: '',
    specialization: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = 'https://luct-reporting-backend-x1cx.onrender.com'; // Match with App.js

  const departments = [
    'FICT - Faculty of Information and Communication Technology',
    'FCTH - Faculty of Computing and Technology',
    'FBMG - Faculty of Business Management',
    'FBCM - Faculty of Communication and Media',
    'FDCI - Faculty of Design and Creative Industries',
    'FABE - Faculty of Architecture and Built Environment',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+266\d{8}$/; // Lesotho format: +266 followed by 8 digits

    // Common validations
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 4) newErrors.username = 'Username must be at least 4 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Role-specific validations
    if (formData.role === 'student') {
      if (!formData.studentNumber.trim()) newErrors.studentNumber = 'Student number is required';
      else if (!/ST\d{6}/.test(formData.studentNumber)) newErrors.studentNumber = 'Student number must be like ST123456';
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Phone must be +266 followed by 8 digits (e.g., +26612345678)';
    } else if (formData.role === 'lecturer' || formData.role === 'prl' || formData.role === 'pl') {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      else if (!/EMP\d{5}/.test(formData.employeeId)) newErrors.employeeId = 'Employee ID must be like EMP12345';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Phone must be +266 followed by 8 digits (e.g., +26612345678)';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        phone: formData.phone,
        department: formData.department,
        ...(formData.role === 'student' && {
          studentNumber: formData.studentNumber,
          yearOfStudy: parseInt(formData.yearOfStudy),
        }),
        ...((formData.role === 'lecturer' || formData.role === 'prl' || formData.role === 'pl') && {
          employeeId: formData.employeeId,
          qualification: formData.qualification || 'N/A',
          specialization: formData.specialization || 'N/A',
        }),
      };

      const response = await fetch(`${API_BASE_URL}/api/register-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('🎉 Registration successful! Please login with your credentials.');
        const newUser = {
          ...registrationData,
          id: Date.now(), // Temporary ID until backend assigns one
          program_id: formData.role === 'pl' ? 'ICT' : undefined,
        };
        localStorage.setItem('user', JSON.stringify(newUser)); // Simulate login
        onRegistrationSuccess();
      } else {
        alert('❌ Registration failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert(`⚠ Registration error: ${error.message}. Ensure backend is running on ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enhanced-registration">
      <div className="registration-header">
        <h2>👋 Join LUCT Reporting System</h2>
        <p>Complete your registration details below</p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-section">
          <h3>🔐 Account Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Choose a username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@limkokwing.ac.ls"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Minimum 6 characters"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">🎓 Student</option>
                <option value="lecturer">👨‍🏫 Lecturer</option>
                <option value="prl">📋 Principal Lecturer</option>
                <option value="pl">👨‍💼 Program Leader</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Specific Fields */}
        {formData.role === 'student' && (
          <div className="form-section">
            <h3>🎓 Student Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Student Number *</label>
                <input
                  type="text"
                  name="studentNumber"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  className={errors.studentNumber ? 'error' : ''}
                  placeholder="e.g., ST123456"
                />
                {errors.studentNumber && <span className="error-message">{errors.studentNumber}</span>}
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Your full name as per university records"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+266 1234 5678"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Year of Study *</label>
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lecturer/PRL/PL Specific Fields */}
        {(formData.role === 'lecturer' || formData.role === 'prl' || formData.role === 'pl') && (
          <div className="form-section">
            <h3>👨‍🏫 Staff Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Your full name"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={errors.employeeId ? 'error' : ''}
                  placeholder="e.g., EMP12345"
                />
                {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+266 1234 5678"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Highest Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., PhD Computer Science"
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Your area of expertise"
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '⏳ Registering...' : '✅ Complete Registration'}
          </button>
          <button type="button" className="clear-btn" onClick={onBackToLogin}>
            ↩ Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedRegistration;
