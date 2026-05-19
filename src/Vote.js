import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vote = ({ username }) => {
    const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
    const [hasVoted, setHasVoted] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [anonymousId, setAnonymousId] = useState("");
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

    // 1. Countdown clock loop logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // 2. Fetch data from database on load (Stops user from re-voting after re-login)
    useEffect(() => {
        const checkUserStatus = async () => {
            if (!username) return;
            try {
                // Get updated vote scores
                const resRes = await fetch('/api/result');
                const resData = await resRes.json();
                setResults(resData);

                // Get current user's profile status
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

    // 3. Handle User Voting Button Click
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

            // Immediately grab fresh results scores
            const resRes = await fetch('/api/result');
            const resData = await resRes.json();
            setResults(resData);
        } catch (err) {
            setError(err.message);
        }
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
                    <h4 className="mb-0">Voting Screen (Voter: {username})</h4>
                    <span className="badge bg-dark">Time: {formatTime(timeLeft)}</span>
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
            </div>
        </div>
    );
};

export default Vote;