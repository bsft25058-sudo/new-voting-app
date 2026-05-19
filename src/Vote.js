import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vote = ({ username }) => {
    const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
    const [hasVoted, setHasVoted] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [anonymousId, setAnonymousId] = useState(""); // Holds random receipt id tracking string token
    
    const CUSTOM_DURATION = 300; // 5 Minutes core countdown parameter window

    // LocalStorage initial validation block setting the session epoch timestamp checkpoint
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

    // Enforces the standard clock decrements looping sequence framework ruleset
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerInterval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [timeLeft]);

    // Simple formatting rule wrapper outputs matching MM:SS UI string layout criteria
    const formatTimeDisplay = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Synchronizes view state values with MongoDB parameters using GET calls
    const fetchResults = async () => {
        try {
            const response = await fetch('/api/result');
            if (!response.ok) throw new Error('Failed to synchronize current poll data frames.');
            const data = await response.json();
            setResults(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to establish remote server handshake context data stream.');
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // Form payload posting request framework validating parameters before network executions
    const handleVoteSubmission = async (candidateName) => {
        // ENFORCE TIMER CHECK BEFORE FIRING REQUEST
        if (timeLeft === 0) {
            setError("Voting window deadline has reached zero! Ballot entry blocked.");
            return;
        }

        try {
            setError(null);
            setSuccessMessage(null);

            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, candidate: candidateName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Network cluster rejected balloting payload submission request.');
            }

            // Bind the returned alphanumeric tracking token payload string right to app memory
            if (data.votingId) {
                setAnonymousId(data.votingId);
            }

            setHasVoted(true);
            setSuccessMessage(data.message);
            fetchResults(); // Trigger dynamic display counters refresh
        } catch (err) {
            setError(err.message || 'Remote socket cluster communication disruption anomaly encountered.');
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <div className="card shadow-lg p-4 border-0 rounded-4">
                {/* Interface Context Status Metrics Headers Container View */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-0 text-primary fw-extrabold tracking-tight">E-Ballot Box</h2>
                        <small className="text-muted text-uppercase fw-semibold font-monospace">Voter: <span className="text-dark">{username}</span></small>
                    </div>
                    <span className={`badge px-3 py-2 rounded-pill fs-6 fw-bold shadow-sm ${timeLeft === 0 ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                        ⏱️ Session Time: {formatTimeDisplay(timeLeft)}
                    </span>
                </div>

                <hr className="opacity-10 my-3" />

                {/* Subtitle Hint Banner Wrapper Context Panel */}
                {timeLeft > 0 && !hasVoted && (
                    <p className="text-center text-muted small my-3 italic">
                        Please cast your selection carefully. Ballots are encrypted and submission operations are irreversible.
                    </p>
                )}

                {/* Interactive System Issue Notification Panel Frame Container */}
                {error && <div className="alert alert-danger text-center fw-bold border-0 shadow-sm rounded-3">{error}</div>}

                {/* COMPLETED RESPONSE STATUS RENDER INTERFACE PANEL BLOCK WITH GENERATED ANONYMOUS SLIDE SYNC RECEIPTS */}
                {hasVoted && successMessage && (
                    <div className="alert alert-success border-0 shadow-sm text-center py-4 my-4 rounded-4 bg-opacity-10">
                        <div className="display-4 mb-2">✔️</div>
                        <h4 className="fw-extrabold text-success text-uppercase tracking-wide">Ballot Count Complete</h4>
                        <p className="mb-3 text-secondary small">{successMessage}</p>
                        
                        <div className="bg-white border rounded-3 p-3 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
                            <span className="text-muted d-block font-monospace tracking-wider text-uppercase small mb-1">Secure Anonymous Ballot ID Receipt</span>
                            <span className="font-monospace fs-4 fw-black text-dark tracking-widest">{anonymousId}</span>
                        </div>
                    </div>
                )}

                {/* CORE OPERATIONAL BALLOT INTERACTION ACTION BOARD PANELS CONTAINER SELECTION */}
                <div className="my-4">
                    {/* PTI Operational Element Block Entry Layout Trigger Row */}
                    <button 
                        className="btn btn-outline-success w-100 py-3 mb-3 fw-bold text-start rounded-3 d-flex justify-content-between align-items-center shadow-sm"
                        disabled={timeLeft === 0 || hasVoted}
                        onClick={() => handleVoteSubmission('PTI')}
                    >
                        <span>🏏 Vote for PTI</span>
                        {hasVoted && <span className="badge bg-success shadow-sm rounded-pill font-monospace">{results.PTI || 0} Votes</span>}
                    </button>

                    {/* PMLN Operational Element Block Entry Layout Trigger Row */}
                    <button 
                        className="btn btn-outline-primary w-100 py-3 mb-3 fw-bold text-start rounded-3 d-flex justify-content-between align-items-center shadow-sm"
                        disabled={timeLeft === 0 || hasVoted}
                        onClick={() => handleVoteSubmission('PMLN')}
                    >
                        <span>🦁 Vote for PMLN</span>
                        {hasVoted && <span className="badge bg-primary shadow-sm rounded-pill font-monospace">{results.PMLN || 0} Votes</span>}
                    </button>

                    {/* Independent Operational Element Block Entry Layout Trigger Row */}
                    <button 
                        className="btn btn-outline-warning w-100 py-3 mb-3 fw-bold text-start text-dark rounded-3 d-flex justify-content-between align-items-center shadow-sm"
                        disabled={timeLeft === 0 || hasVoted}
                        onClick={() => handleVoteSubmission('Independent')}
                    >
                        <span>📢 Vote for Independent</span>
                        {hasVoted && <span className="badge bg-warning text-dark shadow-sm rounded-pill font-monospace">{results.Independent || 0} Votes</span>}
                    </button>
                </div>

                {/* Absolute Target Time Limit Deadline Reached Lock Warning Notification Message Area */}
                {timeLeft === 0 && (
                    <div className="alert bg-light border text-secondary text-center fw-bold text-uppercase small tracking-widest rounded-3 mt-2 shadow-sm py-3">
                        🚫 Balloting Window Closed • Session Concluded
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vote;