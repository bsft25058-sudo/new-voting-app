import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vote = ({ username }) => {
  const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  // Set your timer duration here (e.g., 300 = 5 minutes, 600 = 10 minutes)
  const CUSTOM_DURATION = 300; 

  const [timeLeft, setTimeLeft] = useState(() => {
    const existingExpiry = localStorage.getItem('voting_session_expiry');
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (existingExpiry) {
      const delta = parseInt(existingExpiry, 10) - currentTimestamp;
      return delta > 0 ? delta : 0;
    } else {
      const targetExpiry = currentTimestamp + CUSTOM_DURATION;
      localStorage.setItem('voting_session_expiry', targetExpiry.toString());
      return CUSTOM_DURATION;
    }
  });

  // Fetch live polling updates from database via unified Vercel endpoint
  const fetchResults = async () => {
    try {
      const response = await fetch('/api/result');
      if (!response.ok) throw new Error('Could not synchronize data with database server.');
      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server.');
    }
  };

  useEffect(() => {
    fetchResults();

    // Session countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Submit the selected vote directly to the database backend
  const handleVoteSubmission = async (candidateName) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate: candidateName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ballot.');
      }

      setHasVoted(true);
      setSuccessMessage(`Thank you, ${username}! Your ballot for ${candidateName} was safely cast.`);
      fetchResults(); // Instantly refresh figures locally
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: '650px' }}>
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <h3 className="text-dark fw-bold mb-0">E-Ballot Box</h3>
            <small className="text-muted">Voter Profile: <span className="text-primary fw-bold">{username}</span></small>
          </div>
          <div className="text-end">
            <span className="badge bg-danger p-2 fs-6">⏱️ Session: {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Status Alerts */}
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {successMessage && <div className="alert alert-success text-center fw-bold">{successMessage}</div>}

        {/* Polling/Voting Mechanism Interface */}
        {!hasVoted ? (
          <div>
            <h5 className="text-secondary text-center mb-4">Please cast your vote carefully. This action cannot be reversed.</h5>
            <div className="vstack gap-3">
              <button 
                onClick={() => handleVoteSubmission('PTI')} 
                className="btn btn-outline-success btn-lg fw-bold p-3 shadow-sm"
              >
                🏏 Vote for PTI
              </button>
              <button 
                onClick={() => handleVoteSubmission('PMLN')} 
                className="btn btn-outline-primary btn-lg fw-bold p-3 shadow-sm"
              >
                🦁 Vote for PMLN
              </button>
              <button 
                onClick={() => handleVoteSubmission('Independent')} 
                className="btn btn-outline-warning btn-lg fw-bold text-dark p-3 shadow-sm"
              >
                💪 Vote for Independent
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="fs-1 mb-2">✅</div>
            <h4 className="text-success fw-bold">Ballot Cast Successfully</h4>
            <p className="text-muted">Your vote has been securely encrypted and aggregated into the public standing counters below.</p>
            
            {/* Quick Live Preview Box */}
            <div className="bg-light p-3 rounded border text-start mt-4">
              <h6 className="fw-bold text-center border-bottom pb-2">Updated Standing Breakdown</h6>
              <div className="d-flex justify-content-between my-2"><span>PTI:</span> <strong>{results.PTI} Votes</strong></div>
              <div className="d-flex justify-content-between my-2"><span>PMLN:</span> <strong>{results.PMLN} Votes</strong></div>
              <div className="d-flex justify-content-between my-2"><span>Independent:</span> <strong>{results.Independent} Votes</strong></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// CRITICAL FIX: Ensured the export matches the exact file name 'Vote'
export default Vote;