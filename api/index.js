const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// DATABASE CONNECTION & MONGODB SCHEMAS
// ----------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://root:root@cluster0.mongodb.net/voting_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Successfully connected to MongoDB Cloud Cluster."))
    .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hasVoted: { type: Boolean, default: false }
});

const voteCountSchema = new mongoose.Schema({
    PTI: { type: Number, default: 0 },
    PMLN: { type: Number, default: 0 },
    Independent: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const VoteCount = mongoose.models.VoteCount || mongoose.model('VoteCount', voteCountSchema);

// ----------------------------------------------------
// AUTHENTICATION ROUTES (LOGIN & REGISTER)
// ----------------------------------------------------
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Missing fields" });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username already taken." });

        const newUser = new User({ username, password, hasVoted: false });
        await newUser.save();
        res.json({ success: true, message: "Account registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Registration error." });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(400).json({ error: "Invalid username or password." });

        // FIX: Explicitly send back the user's voting status on login
        res.json({ 
            success: true, 
            username: user.username, 
            hasVoted: user.hasVoted 
        });
    } catch (err) {
        res.status(500).json({ error: "Login error." });
    }
});

// NEW FIX ENDPOINT: Let the frontend query a user's status after logging back in
app.get('/api/user-status', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ error: "Missing username parameter" });

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ hasVoted: user.hasVoted });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user state." });
    }
});

// ----------------------------------------------------
// CORE BALLOT ROUTE (WITH DOUBLE-VOTE BLOCK)
// ----------------------------------------------------
app.post('/api/vote', async (req, res) => {
    try {
        const { username, candidate } = req.body;

        if (!username || !candidate) {
            return res.status(400).json({ error: "Missing profile context or candidate selection." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.hasVoted) {
            return res.status(400).json({ error: "Security Restriction: You have already cast your ballot!" });
        }

        // Increments candidate tally inside 'votecounts' collection
        await VoteCount.findOneAndUpdate(
            {}, 
            { $inc: { [candidate]: 1 } }, 
            { new: true, upsert: true }
        );

        user.hasVoted = true;
        await user.save();

        const anonymousBallotId = "VOTE-" + Math.random().toString(36).substring(2, 9).toUpperCase();

        res.json({ 
            success: true, 
            message: `Your ballot was registered securely.`,
            votingId: anonymousBallotId 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server data exception error." });
    }
});

// ----------------------------------------------------
// LIVE STATISTICS ENDPOINT
// ----------------------------------------------------
app.get('/api/result', async (req, res) => {
    try {
        const counts = await VoteCount.findOne({});
        res.json(counts || { PTI: 0, PMLN: 0, Independent: 0 });
    } catch (err) {
        res.status(500).json({ error: "Failed to grab live results." });
    }
});

module.exports = app;