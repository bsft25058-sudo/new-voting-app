const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TaimoorShahid:taimoor2007@online-voting.system.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("MongoDB Connected Successfully!"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Schemas & Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const VoteSchema = new mongoose.Schema({
  candidate: { type: String, required: true },
  votedAt: { type: Date, default: Date.now }
});
const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema);

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const newUser = new User({ username, password });
    await newUser.save();
    return res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to register user" });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "Invalid username or password" });
    return res.status(200).json({ message: "Login successful!", username: user.username });
  } catch (error) {
    return res.status(500).json({ error: "Server error during login" });
  }
});

// Submit Vote Endpoint
app.post('/api/vote', async (req, res) => {
  try {
    const { candidate } = req.body;
    if (!candidate) return res.status(400).json({ error: "Candidate selection is required" });

    const newVote = new Vote({ candidate });
    await newVote.save();
    return res.status(201).json({ message: "Vote cast successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit your vote" });
  }
});

// Get Election Results Endpoint
app.get('/api/results', async (req, res) => {
  try {
    const votes = await Vote.find();
    const results = { PTI: 0, PMLN: 0, Independent: 0 };
    votes.forEach(vote => {
      if (results[vote.candidate] !== undefined) results[vote.candidate]++;
    });
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch polling results" });
  }
});

// Export app for Vercel Serverless environment handling
module.exports = app;