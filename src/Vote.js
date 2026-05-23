import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vote = ({ username: propUsername }) => {
  // Safe Fallback: Check local storage if the parent component forgot to pass the username prop
  const username = propUsername || localStorage.getItem("username") || "Guest";

  const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [anonymousId, setAnonymousId] = useState("");
  
  const [timeLeft, setTimeLeft] = useState(null); 
  const [expiresAt, setExpiresAt] = useState(null);

  // FIXED: Explicit absolute production API base path
  const API_URL = "https://new-voting-app-jade.vercel.app/api";

  const fetchGlobalData = useCallback(async () => {
    try {
      const timerRes = await fetch(`${API_URL}/timer`);
      if (timerRes.ok) {
        const timerData = await timerRes.json();
        setExpiresAt(timerData.expiresAt);
      }

      const resRes = await fetch(`${API_URL}/result`);
      const resData = await resRes.json();
      setResults(resData);
    } catch (err) {
      console.error("Synchronization background failure:", err);
    }
  }, [API_URL]);

  // FIXED: Added missing closing brackets around fetch config arguments
  const handleAdminReset = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`${API_URL}/timer/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: 10 })
      }); // <-- FIXED: Added missing closing brace and parenthesis here
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reset failed");
      
      setExpiresAt(data.expiresAt); 
      setSuccessMessage("Global cluster timer updated! Refreshing connected devices...");
    } catch (err) {
      setError("Admin Control Override Failure: " + err.message);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const syncInterval = setInterval(fetchGlobalData, 5000);
    return () => clearInterval(syncInterval);
  }, [fetchGlobalData]);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!username || username === "Guest") return;
      try {
        const statusRes = await fetch(`${API_URL}/user-status?username=${encodeURIComponent(username)}`);
        const statusData = await statusRes.json();
        if (statusData.hasVoted) {
          setHasVoted(true);
          setSuccessMessage("Your secure ballot has already been recorded in MongoDB!");
        }
      } catch (err) {
        console.error("Status check crash:", err);
      }
    };
    checkUserStatus();
  }, [username, API_URL]);

  useEffect(() => {
    if (!expiresAt) return;

    const runCountdown = () => {
      const targetTime = new Date(expiresAt).getTime();
      const currentTime = new Date().getTime();
      const difference = Math.floor((targetTime - currentTime) / 1000);

      if (difference <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(difference);
      }
    };

    runCountdown(); 
    const timer = setInterval(runCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const handleVote = async (candidate) => {
    if (timeLeft === 0) {
      setError("Voting time has ended!");
      return;
    }
    if (username === "Guest") {
      setError("Cannot submit vote as Guest user session. Please authenticate.");
      return;
    }
    try {
      setError(null);
      const response = await fetch(`${API_URL}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, candidate }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setHasVoted(true);
      setAnonymousId(data.votingId); 
      setSuccessMessage("Vote submitted securely!");

      const resRes = await fetch(`${API_URL}/result`);
      const resData = await resRes.json();
      setResults(resData);
    } catch (err) {
      setError(err.message);
    }
  };

  // FIXED: Explicitly purges active authorization session cache token data on exit
  const handleLogout = () => {
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "Loading...";
    if (seconds === 0) return "Voting Ended";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="card p-4 shadow-lg border-0 rounded-3" style={{ width: '100%', maxWidth: '500px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <div>
            <h4 className="mb-0 text-dark fw-bold">Ballot Panel</h4>
            <span className="text-muted small font-monospace">User: {username}</span>
          </div>
          <span className={`badge px-3 py-2 fs-6 rounded-pill ${timeLeft === 0 ? 'bg-danger' : 'bg-dark'}`}>
            {timeLeft === 0 ? "🔒 Ended" : `⏱️ ${formatTime(timeLeft)}`}
          </span>
        </div>

        {error && <div className="alert alert-danger text-center small p-2 fw-semibold">{error}</div>}
        {successMessage && <div className="alert alert-success text-center small p-2 fw-semibold">{successMessage}</div>}
        
        {anonymousId && (
          <div className="alert alert-light border border-info text-center font-monospace small mb-3">
            <strong>Ballot Receipt Reference ID:</strong> <br/> {anonymousId}
          </div>
        )}

        <div className="mt-3">
          <button 
            className="btn btn-outline-success w-100 mb-3 py-3 d-flex justify-content-between align-items-center fw-bold" 
            disabled={timeLeft === 0 || timeLeft === null || hasVoted} 
            onClick={() => handleVote('PTI')}
          >
            <span>🏏 Vote for PTI</span>
            {timeLeft === 0 && <span className="badge bg-success fs-6 font-monospace">{results.PTI} Votes</span>}
          </button>

          <button 
            className="btn btn-outline-primary w-100 mb-3 py-3 d-flex justify-content-between align-items-center fw-bold" 
            disabled={timeLeft === 0 || timeLeft === null || hasVoted} 
            onClick={() => handleVote('PMLN')}
          >
            <span>🦁 Vote for PMLN</span>
            {timeLeft === 0 && <span className="badge bg-primary fs-6 font-monospace">{results.PMLN} Votes</span>}
          </button>
          
          <button 
            className="btn btn-outline-warning text-dark w-100 mb-3 py-3 d-flex justify-content-between align-items-center fw-bold" 
            disabled={timeLeft === 0 || timeLeft === null || hasVoted} 
            onClick={() => handleVote('Independent')}
          >
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

      <div className="mt-4 p-3 bg-light rounded shadow-sm text-center border" style={{ width: '100%', maxWidth: '500px' }}>
        <p className="text-muted small mb-2 fw-semibold">⚙️ Presentation Administration Panel</p>
        <button 
          onClick={handleAdminReset} 
          className="btn btn-sm btn-dark px-4 fw-bold border-0"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          🔄 Synchronize & Reset New 10-Min Timer
        </button>
        <div className="text-muted text-center mt-2" style={{ fontSize: '10px' }}>
          Clicking this updates MongoDB instantly. All connected laptop or mobile phone clients will auto-sync within 5 seconds.
        </div>
      </div>
    </div>
  );
};

export default Vote;