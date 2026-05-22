import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // This matches the exact green "Account created!" success alert banner from your screenshot
    const [message, setMessage] = useState("Account created! You can now click Log In."); 
    const [isError, setIsError] = useState(false);

    const API_URL = "https://new-voting-app-jade.vercel.app/api";

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // THE CRITICAL FIX: Saves your username so you are no longer a Guest
                localStorage.setItem("username", data.username);
                
                // Redirects directly to your smooth countdown voting dashboard
                window.location.href = "/vote"; 
            } else {
                setIsError(true);
                setMessage(data.error || "Invalid username or password.");
            }
        } catch (err) {
            setIsError(true);
            setMessage("Network error. Please try again.");
        }
    };

    
    const handleGoToRegister = () => {
        window.location.href = "/register"; 
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px' }}>Secure & Double-Ballot Protected System</p>
                
                {message && (
                    <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', border: isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', color: '#2d3748' }} />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', color: '#2d3748' }} />
                    </div>

                    {/* Blue Log In Button */}
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>
                        Log In
                    </button>
                    
                    {/* White Create Account Button connected to your registration section */}
                    <button type="button" onClick={handleGoToRegister} style={{ width: '100%', padding: '12px', backgroundColor: '#ffffff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;