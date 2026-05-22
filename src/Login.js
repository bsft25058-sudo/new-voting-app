import React, { useState } from 'react';

const Login = () => {
    // Form tracking states
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); 
    const [isError, setIsError] = useState(false);

    const API_URL = "https://new-voting-app-jade.vercel.app/api";

    // 1. Handles Logging In
    const handleLogin = async () => {
        if (!username.trim() || !password) {
            setIsError(true);
            setMessage("Please enter both username and password.");
            return;
        }

        setIsError(false);
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: username.trim(), 
                    password: password 
                })
            });
            const data = await res.json();

            if (res.ok && (data.success || data.username || data.token)) {
                const sessionName = data.username || username.trim();
                localStorage.setItem("username", sessionName);
                window.location.href = "/vote";
            } else {
                setIsError(true);
                setMessage(data.error || "Invalid username or password.");
            }
        } catch (err) {
            setIsError(true);
            setMessage("Login error occurred. Check backend connection.");
        }
    };

    // 2. Handles Registering a New Account
    const handleRegister = async () => {
        if (!username.trim() || !password) {
            setIsError(true);
            setMessage("Please enter both a username and password to register.");
            return;
        }

        setIsError(false);
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: username.trim(), 
                    password: password 
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsError(false);
                setMessage("Account created! You can now click Log In.");
                setIsRegistering(false); // Instantly switches view back to log in form!
                setPassword(""); // Clears password field for security
            } else {
                setIsError(true);
                setMessage(data.error || "Username already exists! Choose another name.");
            }
        } catch (err) {
            setIsError(true);
            setMessage("Registration error occurred. Check backend connection.");
        }
    };

    // Helper to toggle between forms and clear previous error texts
    const toggleFormMode = () => {
        setIsRegistering(!isRegistering);
        setMessage("");
        setIsError(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
                
                {/* Keeps your exact project header styling */}
                <h1 style={{ color: '#007bff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', textAlign: 'center' }}>
                    {isRegistering ? "Voter Registration" : "E-Voting Portal"}
                </h1>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                    Secure & Double-Ballot Protected System
                </p>
                
                {/* Dynamic alert banner: Red for errors, Green for successful registration */}
                {message && (
                    <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', border: isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb' }}>
                        {message}
                    </div>
                )}

                <div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>
                            {isRegistering ? "Choose Username" : "Username"}
                        </label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', color: '#2d3748' }} />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', color: '#2d3748' }} />
                    </div>

                    {/* Direct onClick execution hooks to completely bypass form freeze triggers */}
                    {!isRegistering ? (
                        <>
                            <button type="button" onClick={handleLogin} style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>
                                Log In
                            </button>
                            <button type="button" onClick={toggleFormMode} style={{ width: '100%', padding: '12px', backgroundColor: '#6c757d', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Create Account
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={handleRegister} style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>
                                Register Profile
                            </button>
                            <button type="button" onClick={toggleFormMode} style={{ width: '100%', padding: '12px', backgroundColor: '#ffffff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Back to Log In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;