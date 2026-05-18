import React from "react";

function Vote({ timeLeft }) {

  const handleVote = (candidate) => {

    // Voting Ended
    if (timeLeft <= 0) {

      alert("Voting Time Ended");

      return;

    }

    // Current User
    const currentUser = JSON.parse(
      localStorage.getItem("user")
    );

    // Already Voted Users
    let votedUsers = JSON.parse(
      localStorage.getItem("votedUsers")
    ) || [];

    // Check Duplicate Vote
    if (
      votedUsers.includes(currentUser.voterId)
    ) {

      alert("You already voted");

      return;

    }

    // Votes Object
    let votes = JSON.parse(
      localStorage.getItem("votes")
    ) || {

      "PTI": 0,

      "PML(N)": 0,

      "IN-DEPENDENT": 0

    };

    // Add Vote
    votes[candidate]++;

    // Save Votes
    localStorage.setItem(
      "votes",
      JSON.stringify(votes)
    );

    // Save Anonymous IDs
    let voters = JSON.parse(
      localStorage.getItem("voters")
    ) || [];

    voters.push(currentUser.voterId);

    localStorage.setItem(
      "voters",
      JSON.stringify(voters)
    );

    // Save Voted User
    votedUsers.push(currentUser.voterId);

    localStorage.setItem(
      "votedUsers",
      JSON.stringify(votedUsers)
    );

    alert("Vote Submitted Successfully");

  };

  return (

    <div className="row justify-content-center">

      <div className="col-md-8">

        <div className="card vote-card shadow-lg p-4 text-center">

          <h2 className="text-primary mb-4">

            Cast Your Vote

          </h2>

          {/* Timer */}

          <div className="timer-box mb-4">

            ⏳ Time Left: {timeLeft}s

          </div>

          {/* Vote Buttons */}

          <div className="d-grid gap-3">

            <button
              className="btn btn-success vote-btn"
              onClick={() =>
                handleVote("PTI")
              }
            >

              Vote PTI

            </button>

            <button
              className="btn btn-danger vote-btn"
              onClick={() =>
                handleVote("PML(N)")
              }
            >

              Vote PML(N)

            </button>

            <button
              className="btn btn-warning vote-btn"
              onClick={() =>
                handleVote("IN-DEPENDENT")
              }
            >

              Vote IN-DEPENDENT

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Vote;