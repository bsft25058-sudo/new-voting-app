import React, { useEffect, useState } from "react";

function Result() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch results from MongoDB when component mounts
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/results");
        const data = await response.json();
        // Backend returns array: [ { _id: "PTI", count: 5 }, { _id: "PML(N)", count: 2 } ]
        setResults(data);
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // --- Rebuilding your exact dynamic metrics from MongoDB Data ---
  
  // 1. Map MongoDB results array to a clean object matching your old format
  const votesObj = { "PTI": 0, "PML(N)": 0, "IN-DEPENDENT": 0 };
  results.forEach(item => {
    if (item._id in votesObj) {
      votesObj[item._id] = item.count;
    }
  });

  // 2. Get Anonymous Voter IDs from localStorage audit sync
  const voters = JSON.parse(localStorage.getItem("voters")) || [];

  // 3. Dynamic calculations (matching your old algorithms perfectly!)
  const totalVotes = Object.values(votesObj).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(votesObj));
  
  const winners = totalVotes > 0 
    ? Object.keys(votesObj).filter((candidate) => votesObj[candidate] === maxVotes)
    : [];

  if (loading) {
    return (
      <div className="text-center py-5 text-white">
        <h3>Loading Real-Time Tallies from MongoDB...</h3>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card result-card shadow-lg p-4">
          <h2 className="text-center text-success mb-4">Voting Results</h2>

          {/* Total Votes */}
          <h4 className="text-center mb-4">Total Votes: {totalVotes}</h4>

          {/* Candidate Results */}
          <ul className="list-group mb-4">
            {Object.entries(votesObj).map(([candidate, count], index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <strong>{candidate}</strong>
                <span className="badge bg-primary rounded-pill fs-6">{count} Votes</span>
              </li>
            ))}
          </ul>

          {/* Winner or Tie Banner logic */}
          {totalVotes === 0 ? (
            <div className="alert alert-secondary text-center">
              No votes cast yet in this database session.
            </div>
          ) : winners.length > 1 ? (
            <div className="alert alert-warning text-center">
              🤝 Election Result is a TIE
            </div>
          ) : (
            <div className="alert alert-success text-center">
              🏆 Winner: {winners[0]}
            </div>
          )}

          {/* Anonymous IDs list */}
          <h4 className="mt-4 mb-3">Anonymous Voter IDs (Audited)</h4>
          <ul className="list-group">
            {voters.length === 0 ? (
              <li className="list-group-item text-muted text-center">No active logs saved locally.</li>
            ) : (
              voters.map((voter, index) => (
                <li key={index} className="list-group-item font-monospace">
                  🔑 {voter}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Result;