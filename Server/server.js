const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(express.json());
app.use(cors());

// ==========================================
// 2. DATABASE CONNECTION & OPTIMIZATION
// ==========================================
// Fallback connection string optimized for Serverless execution environments
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TaimoorShahid:taimoor2007@online-voting.system.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Fail fast if connection drops instead of hanging
  socketTimeoutMS: 45000,        // Keep socket pipes open longer
})
.then(() => console.log("MongoDB Connected Successfully!"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// ==========================================
// 3. DATABASE SCHEMA & MODELS
// ==========================================
const VoteSchema = new mongoose.Schema({
  candidate: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

const Vote = mongoose.model('Vote', VoteSchema);

// If you have a separate User schema for login registration, it will look like this:
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// ==========================================
// 4. API ROUTING ENDPOINTS (Aligned with vercel.json)
// ==========================================

// --- REGISTER ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "Registration successful!", user: { username } });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful!", token: "mock-jwt-token", username: user.username });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// --- SUBMIT VOTE ROUTE ---
app.post('/api/vote', async (req, res) => {
  try {
    const { candidate } = req.body;
    
    if (!candidate) {
      return res.status(400).json({ error: "Candidate selection is required" });
    }

    const newVote = new Vote({ candidate });
    await newVote.save();
    
    res.status(201).json({ message: "Vote cast successfully!" });
  } catch (error) {
    console.error("Voting Error:", error);
    res.status(500).json({ error: "Failed to submit your vote" });
  }
});

// --- GET ELECTION RESULTS ROUTE ---
app.get('/api/results', async (req, res) => {
  try {
    const votes = await Vote.find();
    
    // Dynamically calculate party counts
    const results = {
      PTI: 0,
      PMLN: 0,
      Independent: 0
    };

    votes.forEach(vote => {
      if (results[vote.candidate] !== undefined) {
        results[vote.candidate]++;
      }
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Results Error:", error);
    res.status(500).json({ error: "Failed to fetch polling results" });
  }
});

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is actively running on port ${PORT}`);
});

module.exports = app; 