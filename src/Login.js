import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {
    setError(""); setMsg("");
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("Account created! You can now click Login.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    setError(""); setMsg("");
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLoginSuccess(data.username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4 shadow-lg border-0 rounded-3" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="text-primary fw-bold">E-Voting Portal</h2>
          <p className="text-muted small">Secure & Anonymous Decentralized Ballot</p>
        </div>
        
        {error && <div className="alert alert-danger p-2 text-center small">{error}</div>}
        {msg && <div className="alert alert-success p-2 text-center small">{msg}</div>}
        
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">Username</label>
          <input type="text" className="form-control" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary">Password</label>
          <input type="password" className="form-control" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        
        <button className="btn btn-primary w-100 py-2 mb-2 fw-bold" onClick={handleLogin}>Log In</button>
        <button className="btn btn-outline-secondary w-100 py-2 fw-bold small" onClick={handleRegister}>Register New Account</button>
      </div>
    </div>
  );
};

export default Login;