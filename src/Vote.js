import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vote = ({ username }) => {
  const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [anonymousId, setAnonymousId] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

  // 1. Basic Timer Loop
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 2. Load Check: Ask database right away if this voter already voted
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!username) return;
      try {
        // Get current scores
        const resRes = await fetch('/api/result');
        const resData = await resRes.json();
        setResults(resData);

        // Check if user voted
        const statusRes = await fetch(`/api/user-status?username=${username}`);
        const statusData = await statusRes.json();
        if (statusData.hasVoted) {
          setHasVoted(true);
          setSuccessMessage("You have already voted!");
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkUserStatus();
  }, [username]);

  // 3. Cast Vote Button Click
  const handleVote = async (candidate) => {
    try {
      setError(null);
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, candidate }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setHasVoted(true);
      setAnonymousId(data.votingId);
      setSuccessMessage(data.message);

      // Refresh scores
      const resRes = await fetch('/api/result');
      const resData = await resRes.json();
      setResults(resData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    window.location.reload(); // Reload back to clean login screen
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card p-4 shadow">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Voter: {username}</h4>
          <span className="badge bg-dark">Time Left: {formatTime(timeLeft)}</span>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {anonymousId && <div className="alert alert-info font-monospace small text-center">Receipt ID: {anonymousId}</div>}

        <div className="mt-4">
          <button className="btn btn-outline-success w-100 mb-2 py-2 d-flex justify-content-between" disabled={timeLeft === 0 || hasVoted} onClick={() => handleVote('PTI')}>
            <span>Vote for PTI</span>
            {hasVoted && <span>{results.PTI} Votes</span>}
          </button>

          <button className="btn btn-outline-primary w-100 mb-2 py-2 d-flex justify-content-between" disabled={timeLeft === 0 || hasVoted} onClick={() => handleVote('PMLN')}>
            <span>Vote for PMLN</span>
            {hasVoted && <span>{results.PMLN} Votes</span>}
          </button>

          <button className="btn btn-outline-warning text-dark w-100 mb-2 py-2 d-flex justify-content-between" disabled={timeLeft === 0 || hasVoted} onClick={() => handleVote('Independent')}>
            <span>Vote for Independent</span>
            {hasVoted && <span>{results.Independent} Votes</span>}
          </button>
        </div>

        <button className="btn btn-danger btn-sm w-100 mt-4 py-2" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Vote;