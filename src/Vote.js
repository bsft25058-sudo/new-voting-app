import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vote = ({ username }) => {
  const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [anonymousId, setAnonymousId] = useState("");

  // 1. GLOBAL SHARED TIMER LOGIC (Using Unix Timestamp Window)
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedExpiry = localStorage.getItem('global_voting_expiry');
    const now = Math.floor(Date.now() / 1000);

    if (savedExpiry) {
      const remaining = parseInt(savedExpiry, 10) - now;
      return remaining > 0 ? remaining : 0;
    } else {
      const newExpiry = now + 300; // Hardcoded 5-Minute Single Voting Session
      localStorage.setItem('global_voting_expiry', newExpiry.toString());
      return 300;
    }
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 2. RUNS LIVE MONGODB VALIDATION TO BLOCK LOG-IN CHEATING
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!username) return;
      try {
        const resRes = await fetch('/api/result');
        const resData = await resRes.json();
        setResults(resData);

        const statusRes = await fetch(`/api/user-status?username=${username}`);
        const statusData = await statusRes.json();
        if (statusData.hasVoted) {
          setHasVoted(true);
          setSuccessMessage("Your secure ballot has already been recorded in MongoDB!");
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkUserStatus();
  }, [username]);

  const handleVote = async (candidate) => {
    if (timeLeft === 0) {
      setError("Voting time has ended!");
      return;
    }
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
      setAnonymousId(data.votingId); // Sets individual receipt proof ID
      setSuccessMessage("Vote submitted securely!");

      const resRes = await fetch('/api/result');
      const resData = await resRes.json();
      setResults(resData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    window.location.reload(); 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow-lg border-0 rounded-3" style={{ width: '100%', maxWidth: '500px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <div>
            <h4 className="mb-0 text-dark fw-bold">Ballot Panel</h4>
            <span className="text-muted small font-monospace">User: {username}</span>
          </div>
          <span className={`badge px-3 py-2 fs-6 rounded-pill ${timeLeft === 0 ? 'bg-danger' : 'bg-dark'}`}>
            ⏱️ {formatTime(timeLeft)}
          </span>
        </div>

        {error && <div className="alert alert-danger text-center small p-2 fw-semibold">{error}</div>}
        {successMessage && <div className="alert alert-success text-center small p-2 fw-semibold">{successMessage}</div>}
        
        {/* 4. SHOW UNIQUE GENERATED IDENTITY CODE */}
        {anonymousId && (
          <div className="alert alert-light border border-info text-center font-monospace small mb-3">
            <strong>Ballot Receipt Reference ID:</strong> <br/> {anonymousId}
          </div>
        )}

        <div className="mt-3">
          {/* PTI BUTTON */}
          <button className="btn btn-outline-success w-100 mb-3 py-3 d-flex justify-content-between align-items-center fw-bold" disabled={timeLeft === 0 || hasVoted} onClick={() => handleVote('PTI')}>
            <span>🏏 Vote for PTI</span>
            {/* 3. CONDITIONAL VISIBILITY: Hides numbers until timer hits zero */}
            {timeLeft === 0 && <span className="badge bg-success fs-6 font-monospace">{results.PTI} Votes</span>}
          </button>

          {/* PMLN BUTTON */}
          <button className="btn btn-outline-primary w-100 mb-3 py-3 d-flex justify-content-between align-items-center fw-bold" disabled={timeLeft === 0 || hasVoted} onClick={() => handleVote('PMLN')}>
            <span>🦁 Vote for PMLN</span>
            {timeLeft === 0 && <span className="badge bg-primary fs-6 font-monospace">{results.PMLN} Votes</span>}
          </button>

          {/* INDEPENDENT BUTTON */}
          <button className="btn btn-outline-warning text-dark w-100 mb-3 py-3 d-flex justify-content-between align-items-center fw-bold" disabled={timeLeft === 0 || hasVoted} onClick={() => handleVote('Independent')}>
            <span>📢 Vote for Independent</span>
            {timeLeft === 0 && <span className="badge bg-warning text-dark fs-6 font-monospace">{results.Independent} Votes</span>}
          </button>
        </div>

        {timeLeft === 0 && (
          <div className="alert alert-warning text-center fw-bold small my-2">
            🔒 Voting Complete. Final Results Released Above!
          </div>
        )}

        <button className="btn btn-danger w-100 mt-4 py-2 fw-semibold" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
};

export default Vote;