import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setMessage({ text: 'Please fill in all fields.', isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

   
    const endpoint = isLoginView ? '/api/login' : '/api/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        
        throw new Error(data.error || 'Something went wrong.');
      }

      if (isLoginView) {
        // --- LOGIN SUCCESS ---
        setMessage({ text: 'Login successful! Redirecting...', isError: false });
        
        // Save auth data to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        
        // Trigger state change to display the voting dashboard layout
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(data.username);
        }
      } else {
        // --- REGISTRATION SUCCESS ---
        setMessage({ text: 'Registration successful! Please login.', isError: false });
        setIsLoginView(true); // Toggle automatically to login page view
        setPassword('');      // Clear password field for security
      }

    } catch (error) {
      console.error('Authentication Error:', error);
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center text-primary mb-4">Online Voting System</h2>
        <h4 className="text-center mb-3">{isLoginView ? 'Login' : 'Create New Account'}</h4>

        {/* Status Message Display */}
        {message.text && (
          <div className={`alert ${message.isError ? 'alert-danger' : 'alert-success'} py-2 text-center`} role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`btn ${isLoginView ? 'btn-primary' : 'btn-success'} w-100 py-2 mb-2`}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLoginView ? 'Login' : 'Register Account'}
          </button>
        </form>

        {/* View Toggle Button */}
        <button
          className="btn btn-warning text-white w-100 py-2"
          onClick={() => {
            setIsLoginView(!isLoginView);
            setMessage({ text: '', isError: false });
            setPassword('');
          }}
          disabled={loading}
        >
          {isLoginView ? 'Create New Account' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;