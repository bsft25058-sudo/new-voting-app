import React from "react";

function Result() {

  // Get Votes
  const votes = JSON.parse(
    localStorage.getItem("votes")
  ) || {};

  // Get Anonymous Voter IDs
  const voters = JSON.parse(
    localStorage.getItem("voters")
  ) || [];

  // Total Votes
  const totalVotes = Object.values(votes).reduce(
    (a, b) => a + b,
    0
  );

  // Highest Votes
  const maxVotes = Math.max(
    ...Object.values(votes)
  );

  // Winner / Tie Check
  const winners = Object.keys(votes).filter(
    (candidate) =>
      votes[candidate] === maxVotes
  );

  return (

    <div className="row justify-content-center">

      <div className="col-md-8">

        <div className="card result-card shadow-lg p-4">

          <h2 className="text-center text-success mb-4">

            Voting Results

          </h2>

          {/* Total Votes */}

          <h4 className="text-center mb-4">

            Total Votes: {totalVotes}

          </h4>

          {/* Candidate Results */}

          <ul className="list-group mb-4">

            {
              Object.entries(votes).map(
                ([candidate, count], index) => (

                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between"
                  >

                    <strong>{candidate}</strong>

                    <span>{count} Votes</span>

                  </li>
                )
              )
            }

          </ul>

          {/* Winner or Tie */}

          {
            winners.length > 1 ? (

              <div className="alert alert-warning text-center">

                🤝 Election Result is a TIE

              </div>

            ) : (

              <div className="alert alert-success text-center">

                🏆 Winner: {winners[0]}

              </div>

            )
          }

          {/* Anonymous IDs */}

          <h4 className="mt-4 mb-3">

            Anonymous Voter IDs

          </h4>

          <ul className="list-group">

            {
              voters.map((voter, index) => (

                <li
                  key={index}
                  className="list-group-item"
                >

                  {voter}

                </li>
              ))
            }

          </ul>

        </div>

      </div>

    </div>

  );

}

export default Result;