import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Voting = ({ username }) => {
  const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes countdown timer

  // Fetch live polling updates from database
  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      if (!response.ok) throw new Error('Could not fetch data');
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
    
    // Countdown timer calculation sequence
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const castVote = async (candidate) => {
    if (hasVoted) {
      alert("You have already cast your ballot!");
      return;
    }

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate })
      });

      if (!response.ok) throw new Error('Voting failed');

      alert(`Your vote for ${candidate} has been recorded!`);
      setHasVoted(true);
      fetchResults(); // Refresh visual graph logs immediately
    } catch (err) {
      alert("Error submitting vote. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, <span className="text-primary">{username}</span>!</h2>
        <div className="badge bg-danger p-2 fs-6">Time Remaining: {formatTime(timeLeft)}</div>
      </div>

      {error && (
        <div className="alert alert-info text-center" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4 text-center">
        {/* PTI Card */}
        <div className="col-md-4">
          <div className="card shadow-sm border-success h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <h3 className="card-title text-success fw-bold">PTI</h3>
              <p className="fs-1 my-3">{results.PTI}</p>
              <button onClick={() => castVote('PTI')} className="btn btn-success w-100 py-2" disabled={hasVoted}>
                Vote PTI
              </button>
            </div>
          </div>
        </div>

        {/* PMLN Card */}
        <div className="col-md-4">
          <div className="card shadow-sm border-primary h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <h3 className="card-title text-primary fw-bold">PMLN</h3>
              <p className="fs-1 my-3">{results.PMLN}</p>
              <button onClick={() => castVote('PMLN')} className="btn btn-primary w-100 py-2" disabled={hasVoted}>
                Vote PMLN
              </button>
            </div>
          </div>
        </div>

        {/* Independent Card */}
        <div className="col-md-4">
          <div className="card shadow-sm border-warning h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <h3 className="card-title text-warning fw-bold">Independent</h3>
              <p className="fs-1 my-3">{results.Independent}</p>
              <button onClick={() => castVote('Independent')} className="btn btn-warning text-white w-100 py-2" disabled={hasVoted}>
                Vote Independent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voting;