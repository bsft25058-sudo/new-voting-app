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
      setMsg("Registered successfully! Now click Login.");
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
      
      // Send username up to App.js
      onLoginSuccess(data.username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card p-4 shadow">
        <h3 className="text-center mb-4">E-Voting System</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}
        <div className="mb-3">
          <label>Username</label>
          <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>Login</button>
        <button className="btn btn-secondary w-100" onClick={handleRegister}>Register New Account</button>
      </div>
    </div>
  );
};

export default Login;