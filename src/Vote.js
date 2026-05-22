import React, { useState, useEffect, useCallback, useRef } from 'react';

const Vote = () => {
    // 1. Get current logged-in user details from browser storage
    const username = localStorage.getItem("username") || "Guest";
    
    // 2. State management for timer, voting status, and results
    const [timeLeft, setTimeLeft] = useState("");
    const [isTimerExpired, setIsTimerExpired] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [receiptCode, setReceiptCode] = useState("");
    const [results, setResults] = useState({ PTI: 0, PMLN: 0, Independent: 0 });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Backend Base API URL
    const API_URL = "https://new-voting-app-jade.vercel.app/api";
    
    // Reference pointer to keep track of the changing target expiration time
    const targetTimeRef = useRef(null);

    // 3. Helper function to check if this user has already voted
    const checkUserVotingStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/user-status?username=${encodeURIComponent(username)}`);
            const data = await res.json();
            if (data.hasVoted) {
                setHasVoted(true);
            }
        } catch (err) {
            console.error("Error checking user status:", err);
        }
    }, [username, API_URL]);

    // 4. Helper function to fetch final vote tallies from MongoDB Atlas
    const fetchElectionResults = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/result`);
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error("Error fetching results:", err);
        }
    }, [API_URL]);

    // 5. Network Sync Effect: Fetches the authoritative timer from the backend every 5 seconds
    useEffect(() => {
        checkUserVotingStatus();

        const syncTimerWithBackend = async () => {
            try {
                const res = await fetch(`${API_URL}/timer`);
                const data = await res.json();
                if (data.expiresAt) {
                    targetTimeRef.current = new Date(data.expiresAt).getTime();
                }
            } catch (err) {
                console.error("Failed to sync timer with backend:", err);
            }
        };

        syncTimerWithBackend();
        const syncInterval = setInterval(syncTimerWithBackend, 5000);

        return () => clearInterval(syncInterval);
    }, [checkUserVotingStatus, API_URL]);

    // 6. Smooth Local Render Effect: Forces the clock display to update fluidly every single second (1000ms)
    useEffect(() => {
        const updateClockDisplay = () => {
            if (!targetTimeRef.current) return;

            const now = new Date().getTime();
            const difference = targetTimeRef.current - now;

            if (difference <= 0) {
                setTimeLeft("Voting Ended");
                setIsTimerExpired(true);
                fetchElectionResults(); // Instantly show scoreboard when clock hits zero
            } else {
                setIsTimerExpired(false);
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        };

        const localClockInterval = setInterval(updateClockDisplay, 1000);
        return () => clearInterval(localClockInterval);
    }, [fetchElectionResults]);

    // 7. Function to handle casting a vote
    const castVote = async (candidateName) => {
        setErrorMessage("");
        setSuccessMessage("");

        if (isTimerExpired) {
            setErrorMessage("Voting period has ended! You can no longer cast a vote.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, candidate: candidateName })
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || "Failed to submit vote.");
                return;
            }

            if (data.success) {
                setHasVoted(true);
                setReceiptCode(data.votingId); // Save anonymous receipt token
                setSuccessMessage(`Vote cast successfully for ${candidateName}!`);
                if (isTimerExpired) fetchElectionResults();
            }
        } catch (err) {
            setErrorMessage("Network error occurred while submitting vote.");
        }
    };

    // 8. Administration Panel Reset Action
    const handleResetTimer = async () => {
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const res = await fetch(`${API_URL}/timer/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ durationMinutes: 5 }) // Re-initializes a clean 5-minute database slot
            });
            const data = await res.json();
            if (res.ok) {
                alert("Master clock successfully set to 5 Minutes across all devices!");
                window.location.reload(); 
            } else {
                setErrorMessage(data.error || "Reset failed");
            }
        } catch (err) {
            setErrorMessage("Failed to talk to administration route.");
        }
    };

    // 9. Log out action
    const handleLogout = () => {
        localStorage.removeItem("username");
        window.location.href = "/"; // Send back to login screen
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>Secure Voting Portal</h2>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Logged in as: <strong>{username}</strong></span>
                </div>
                <button onClick={handleLogout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>

            {/* Error & Success Alert Notification Banners */}
            {errorMessage && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>{errorMessage}</div>}
            {successMessage && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>{successMessage}</div>}

            {/* Live Synchronized Countdown Clock */}
            <div style={{ backgroundColor: '#34495e', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '25px' }}>
                <h4 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px', color: '#bdc3c7' }}>Time Remaining for Election</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace' }}>{timeLeft || "Syncing..."}</div>
            </div>

            {/* MAIN INTERACTIVE BODY AREA */}
            {!isTimerExpired ? (
                <div>
                    {!hasVoted ? (
                        <div>
                            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#34495e' }}>Cast Your Electronic Ballot</h3>
                            
                            {/* Candidate Voting Buttons with Custom Electoral Symbols */}
                            <button onClick={() => castVote("PTI")} style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '22px' }}>🏏</span> Vote for PTI
                            </button>
                            
                            <button onClick={() => castVote("PMLN")} style={{ width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '22px' }}>🦁</span> Vote for PMLN
                            </button>
                            
                            <button onClick={() => castVote("Independent")} style={{ width: '100%', padding: '15px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '22px' }}>🚁</span> Vote for Independent
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 10px', border: '2px dashed #2ecc71', borderRadius: '8px', backgroundColor: '#f9fcf9' }}>
                            <h3 style={{ color: '#2ecc71', margin: '0 0 10px 0' }}>✓ Ballot Cast Successfully</h3>
                            <p style={{ color: '#555', fontSize: '15px' }}>Your user account identity has been stripped to ensure complete privacy.</p>
                            {receiptCode && (
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#eef7ee', borderRadius: '4px', display: 'inline-block' }}>
                                    <span style={{ fontSize: '13px', color: '#666' }}>Anonymous Receipt Token:</span>
                                    <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{receiptCode}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* LIVE RESULTS SECTION (Unlocks with Party Symbols when timer finishes) */
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '0' }}>
                        📊 Final Election Scoreboard
                    </h3>
                    <div style={{ margin: '15px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #ddd' }}>
                            <span style={{ fontWeight: 'bold', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🏏</span> PTI:
                            </span>
                            <span style={{ fontWeight: 'bold' }}>{results.PTI || 0} votes</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #ddd' }}>
                            <span style={{ fontWeight: 'bold', color: '#3498db', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🦁</span> PMLN:
                            </span>
                            <span style={{ fontWeight: 'bold' }}>{results.PMLN || 0} votes</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                            <span style={{ fontWeight: 'bold', color: '#9b59b6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🚁</span> Independent:
                            </span>
                            <span style={{ fontWeight: 'bold' }}>{results.Independent || 0} votes</span>
                        </div>
                    </div>
                </div>
            )}

            {/* SECURITY GUARD FOR THE TIMER CONTROL PANEL */}
            {username === "taimoor_admin" && (
                <div style={{ backgroundColor: '#fdf6e2', padding: '20px', borderRadius: '10px', marginTop: '35px', textAlign: 'center', border: '1px dashed #e67e22' }}>
                    <h3 style={{ color: '#e67e22', margin: '0 0 5px 0', fontSize: '16px' }}>👑 Presentation Administration Panel</h3>
                    <p style={{ color: '#7f8c8d', fontSize: '13px', margin: '0 0 15px 0' }}>This dashboard utility is isolated and hidden from ordinary voters.</p>
                    <button onClick={handleResetTimer} style={{ backgroundColor: '#d35400', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                        🔄 Synchronize & Reset New 5-Min Timer
                    </button>
                </div>
            )}

        </div>
    );
};

export default Vote;