const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://root:root@cluster0.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected"))
    .catch(err => console.error(err));

// Standard schema configurations matching your database folders
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hasVoted: { type: Boolean, default: false }
}, { collection: 'users' });

const voteCountSchema = new mongoose.Schema({
    PTI: { type: Number, default: 0 },
    PMLN: { type: Number, default: 0 },
    Independent: { type: Number, default: 0 }
}, { collection: 'votecounts' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const VoteCount = mongoose.models.VoteCount || mongoose.model('VoteCount', voteCountSchema);

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username taken" });

        const newUser = new User({ username, password, hasVoted: false });
        await newUser.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Register error" });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        res.json({ success: true, username: user.username });
    } catch (err) {
        res.status(500).json({ error: "Login error" });
    }
});

// CHECK USER STATUS (This prevents the double voting trick)
app.get('/api/user-status', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.query.username });
        res.json({ hasVoted: user ? user.hasVoted : false });
    } catch (err) {
        res.status(500).json({ error: "Error checking status" });
    }
});

// SUBMIT VOTE
app.post('/api/vote', async (req, res) => {
    try {
        const { username, candidate } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.hasVoted) return res.status(400).json({ error: "You already voted!" });

        await VoteCount.findOneAndUpdate({}, { $inc: { [candidate]: 1 } }, { upsert: true });
        
        user.hasVoted = true;
        await user.save();

        res.json({ success: true, message: "Vote cast successfully!", votingId: "VOTE-" + Math.random().toString(36).substring(2, 7).toUpperCase() });
    } catch (err) {
        res.status(500).json({ error: "Vote error" });
    }
});

// GET RESULTS
app.get('/api/result', async (req, res) => {
    try {
        const counts = await VoteCount.findOne({});
        res.json(counts || { PTI: 0, PMLN: 0, Independent: 0 });
    } catch (err) {
        res.status(500).json({ error: "Result error" });
    }
});

module.exports = app;