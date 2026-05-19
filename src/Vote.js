import React, { useState } from 'react';

function Vote({ timeLeft }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submitVote = async (candidateName) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidate: candidateName }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Success: ${data.message}`);
      } else {
        setMessage(`Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // --- Keep your existing UI, just attach `submitVote("Candidate Name")` to your buttons ---
  return (
    <div className="card p-4 text-center shadow-sm">
      <h3>Time Remaining: {timeLeft}s</h3>
      <p className="text-muted">Select a candidate below to cast your vote permanently.</p>
      
      {message && <div className="alert alert-info">{message}</div>}
      
      <div className="d-grid gap-3 mt-4">
        <button 
          className="btn btn-primary py-2" 
          disabled={loading} 
          onClick={() => submitVote('Candidate A')}
        >
          {loading ? 'Submitting...' : 'Vote for Candidate A'}
        </button>
        <button 
          className="btn btn-success py-2" 
          disabled={loading} 
          onClick={() => submitVote('Candidate B')}
        >
          {loading ? 'Submitting...' : 'Vote for Candidate B'}
        </button>
      </div>
    </div>
  );
}

export default Vote;