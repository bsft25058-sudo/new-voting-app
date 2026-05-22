import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

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

            if (data.success) {
                // THE ONLY REQUIRED CHANGE: This saves your name so you aren't a Guest!
                localStorage.setItem("username", data.username);
                
                // Redirects back to your voting screen
                window.location.href = "/vote"; 
            } else {
                setMessage(data.error || "Invalid credentials");
            }
        } catch (err) {
            setMessage("Login error occurred.");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Login</h2>
            {message && <p style={{ color: "red" }}>{message}</p>}
            <form onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
                />
                <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
                    Log In
                </button>
            </form>
        </div>
    );
};

export default Login;