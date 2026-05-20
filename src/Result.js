import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Result = () => {
  const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/result');
      
      if (!response.ok) {
        throw new Error('Failed to fetch the latest polling figures.');
      }
      
      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (err) {
      console.error("Results Fetch Error:", err);
      setError("Unable to sync with the live tally server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
   
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  
  const totalVotes = results.PTI + results.PMLN + results.Independent;
  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  return (
    <div className="container py-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: '700px' }}>
        <div className="text-center mb-4">
          <h2 className="text-primary fw-bold">Live Election Standings</h2>
          <p className="text-muted">Total Ballots Cast: <span className="fw-bold text-dark">{totalVotes}</span></p>
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchResults} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Force Refresh'}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        <div className="vstack gap-4">
          
          <div>
            <div className="d-flex justify-content-between mb-1 fw-bold text-success">
              <span>PTI</span>
              <span>{results.PTI} Votes ({calculatePercentage(results.PTI)}%)</span>
            </div>
            <div className="progress" style={{ height: '25px' }}>
              <div 
                className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                style={{ width: `${calculatePercentage(results.PTI)}%` }}
                aria-valuenow={results.PTI} 
                aria-valuemin="0" 
                aria-valuemax={totalVotes || 100}
              ></div>
            </div>
          </div>

        
          <div>
            <div className="d-flex justify-content-between mb-1 fw-bold text-primary">
              <span>PMLN</span>
              <span>{results.PMLN} Votes ({calculatePercentage(results.PMLN)}%)</span>
            </div>
            <div className="progress" style={{ height: '25px' }}>
              <div 
                className="progress-bar bg-primary progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                style={{ width: `${calculatePercentage(results.PMLN)}%` }}
                aria-valuenow={results.PMLN} 
                aria-valuemin="0" 
                aria-valuemax={totalVotes || 100}
              ></div>
            </div>
          </div>

          
          <div>
            <div className="d-flex justify-content-between mb-1 fw-bold text-warning">
              <span>Independent</span>
              <span className="text-dark">{results.Independent} Votes ({calculatePercentage(results.Independent)}%)</span>
            </div>
            <div className="progress" style={{ height: '25px' }}>
              <div 
                className="progress-bar bg-warning progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                style={{ width: `${calculatePercentage(results.Independent)}%` }}
                aria-valuenow={results.Independent} 
                aria-valuemin="0" 
                aria-valuemax={totalVotes || 100}
              ></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Result;