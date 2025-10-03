import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import EnhancedReportForm from './EnhancedReportForm';
import ReportsView from './ReportsView';
import EnhancedRegistration from './EnhancedRegistration';
import './App.css';

// Placeholder component for Search
const SearchView = ({ user }) => (
  <div className="search-view">
    <div className="search-header">
      <h2>🔍 Search & Analytics</h2>
      <p>Search through reports and view comprehensive analytics</p>
    </div>
    <div className="search-content">
      <div className="search-box">
        <input 
          type="text" 
          placeholder="🔍 Search reports by course, topic, or lecturer..." 
          className="search-input"
        />
        <button className="search-btn">Search</button>
      </div>
      <div className="search-results">
        <div className="placeholder-card">
          <h3>Search Functionality</h3>
          <p>Search across all reports by:</p>
          <ul>
            <li>📚 Course Name or Code</li>
            <li>🎯 Topic Taught</li>
            <li>👨‍🏫 Lecturer Name</li>
            <li>📅 Date Range</li>
            <li>🏫 Faculty</li>
          </ul>
          <p className="coming-soon">🔧 Search feature coming soon...</p>
        </div>
      </div>
    </div>
  </div>
);

// Footer Component
const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <div className="footer-section">
        <h3>LUCT Reporting System</h3>
        <p>Faculty of Information Communication Technology<br/>
        Web Application Development - DIWA2110<br/>
        Semester 1 Assignment</p>
      </div>
      
      <div className="footer-section">
        <h3>Contact Information</h3>
        <p>
          📧 Email: liteboho.molaoa@limkokwing.ac.ls<br/>
          🏢 Department: Faculty of ICT<br/>
          📍 Limkokwing University of Creative Technology
        </p>
      </div>
      
      <div className="footer-section">
        <h3>Quick Links</h3>
        <p>
          <a href="#dashboard">📊 Dashboard</a>
          <a href="#reports">📈 View Reports</a>
          <a href="#report">📝 Submit Report</a>
          <a href="#search">🔍 Search</a>
        </p>
      </div>
      
      <div className="footer-section">
        <h3>System Modules</h3>
        <p>
          <a href="#student">🎓 Student Portal</a>
          <a href="#lecturer">👨‍🏫 Lecturer Portal</a>
          <a href="#prl">📋 Principal Lecturer</a>
          <a href="#pl">👨‍💼 Program Leader</a>
        </p>
      </div>
    </div>
    
    <div className="footer-bottom">
      <p>&copy; 2024 Limkokwing University of Creative Technology - Faculty of ICT. All rights reserved.</p>
      <p>Web Application Development - DIWA2110 | Assignment 2</p>
    </div>
  </footer>
);

// API base URL - Ensure backend is running on this port
const API_BASE_URL = 'https://luct-reporting-backend-x1cx.onrender.com';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading to fetch user data
  const [error, setError] = useState('');

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = ['dashboard', 'report', 'reports', 'search', 'student', 'lecturer', 'prl', 'pl'];
      setCurrentView(validViews.includes(hash) ? hash : 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    // Check for existing session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        ...parsedUser,
        fullName: parsedUser.fullName || parsedUser.username,
        id: parsedUser.id || 1,
        role: parsedUser.role || 'student',
        program_id: parsedUser.program_id || 'ICT',
      });
    }
    setLoading(false);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async () => {
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.token && data.user) {
        const newUser = {
          ...data.user,
          fullName: data.user.fullName || data.user.username,
          id: data.user.id || 1,
          role: data.user.role || 'student',
          program_id: data.user.program_id || 'ICT',
        };
        setUser(newUser);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(newUser));
        alert('🎉 Login successful!');
        setCurrentView('dashboard');
        window.location.hash = 'dashboard';
      } else {
        setError('❌ Login failed: ' + (data.error || 'Invalid credentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // More specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError(`⚠ Cannot connect to server. Please ensure the backend is running on ${API_BASE_URL}`);
      } else {
        setError(`⚠ Login error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('dashboard');
    setLoginData({ username: '', password: '' });
    window.location.hash = 'dashboard';
    alert('👋 Logged out successfully!');
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    window.location.hash = view;
  };

  const renderNavigation = () => {
    if (!user) return null;

    const isActive = (view) => currentView === view ? 'active' : '';

    return (
      <nav className="navbar">
        <button
          className={`nav-btn ${isActive('dashboard')}`}
          onClick={() => handleNavigation('dashboard')}
        >
          📊 Dashboard
        </button>
        {['lecturer', 'prl', 'pl'].includes(user.role) && (
          <button
            className={`nav-btn ${isActive('report')}`}
            onClick={() => handleNavigation('report')}
          >
            📝 Submit Report
          </button>
        )}
        {['lecturer', 'prl', 'pl'].includes(user.role) && (
          <button
            className={`nav-btn ${isActive('reports')}`}
            onClick={() => handleNavigation('reports')}
          >
            📈 View Reports
          </button>
        )}
        <button
          className={`nav-btn ${isActive('search')}`}
          onClick={() => handleNavigation('search')}
        >
          🔍 Search
        </button>
        {user.role === 'student' && (
          <button
            className={`nav-btn ${isActive('student')}`}
            onClick={() => handleNavigation('student')}
          >
            🎓 My Portal
          </button>
        )}
        {user.role === 'lecturer' && (
          <button
            className={`nav-btn ${isActive('lecturer')}`}
            onClick={() => handleNavigation('lecturer')}
          >
            👨‍🏫 My Portal
          </button>
        )}
        {user.role === 'prl' && (
          <button
            className={`nav-btn ${isActive('prl')}`}
            onClick={() => handleNavigation('prl')}
          >
            📋 PRL Portal
          </button>
        )}
        {user.role === 'pl' && (
          <button
            className={`nav-btn ${isActive('pl')}`}
            onClick={() => handleNavigation('pl')}
          >
            👨‍💼 PL Portal
          </button>
        )}
        <button
          className={`nav-btn logout-btn ${isActive('logout')}`}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </nav>
    );
  };

  // Render login/register form if no user is logged in
  if (!user && !loading) {
    return (
      <div className="App">
        <header>
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">📊</div>
              <div className="logo-text">
                <h1>LUCT Reporting System</h1>
                <p>Faculty of Information Communication Technology</p>
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="auth-container">
            {!showRegister ? (
              <div className="auth-form">
                <h2>🔐 Welcome Back</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                  Sign in to your account
                </p>
                
                <input 
                  name="username" 
                  value={loginData.username} 
                  onChange={handleLoginChange} 
                  placeholder="👤 Username" 
                  disabled={loading}
                />
                <input 
                  name="password" 
                  type="password" 
                  value={loginData.password} 
                  onChange={handleLoginChange} 
                  placeholder="🔒 Password" 
                  disabled={loading}
                />
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="auth-buttons">
                  <button 
                    className="auth-btn login-btn" 
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                  </button>
                  <button 
                    className="auth-btn register-btn" 
                    onClick={() => setShowRegister(true)}
                    disabled={loading}
                  >
                    📝 Create Account
                  </button>
                </div>

                <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '5px', fontSize: '0.9em' }}>
                  <strong>Demo Accounts:</strong> Use any username/password combination for testing.
                </div>
              </div>
            ) : (
              <EnhancedRegistration 
                onBackToLogin={() => setShowRegister(false)}
                onRegistrationSuccess={() => setShowRegister(false)}
              />
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Render main application if user is logged in or loading
  if (loading) return <div className="App"><h2>Loading...</h2></div>;

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📊</div>
            <div className="logo-text">
              <h1>LUCT Reporting System</h1>
              <p>Welcome, {user.fullName || user.username} ({user.role})</p>
            </div>
          </div>
          {renderNavigation()}
        </div>
      </header>
      
      <main>
        {currentView === 'dashboard' && <Dashboard userRole={user.role} userName={user.fullName || user.username} />}
        {currentView === 'report' && <EnhancedReportForm user={user} />}
        {currentView === 'reports' && <ReportsView user={user} />}
        {currentView === 'search' && <SearchView user={user} />}
        {currentView === 'student' && <Dashboard userRole="student" userName={user.fullName || user.username} />}
        {currentView === 'lecturer' && <Dashboard userRole="lecturer" userName={user.fullName || user.username} />}
        {currentView === 'prl' && <Dashboard userRole="prl" userName={user.fullName || user.username} />}
        {currentView === 'pl' && <Dashboard userRole="pl" userName={user.fullName || user.username} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
