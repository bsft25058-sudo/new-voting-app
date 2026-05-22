const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { dbName: 'test' })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(err));



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


const timerSchema = new mongoose.Schema({
    expiresAt: { type: Date, required: true }
}, { collection: 'timer' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const VoteCount = mongoose.models.VoteCount || mongoose.model('VoteCount', voteCountSchema);
const Timer = mongoose.models.Timer || mongoose.model('Timer', timerSchema);




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

app.get('/api/user-status', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.query.username });
        res.json({ hasVoted: user ? user.hasVoted : false });
    } catch (err) {
        res.status(500).json({ error: "Error checking status" });
    }
});



app.post('/api/vote', async (req, res) => {
    try {
        const { username, candidate } = req.body;
        if (!username) return res.status(400).json({ error: "User identity lost" });

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.hasVoted) return res.status(400).json({ error: "You already voted!" });

        await VoteCount.findOneAndUpdate({}, { $inc: { [candidate]: 1 } }, { upsert: true });
        
        user.hasVoted = true;
        await user.save();

        const receiptToken = "BALLOT-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        res.json({ success: true, votingId: receiptToken });
    } catch (err) {
        res.status(500).json({ error: "Vote error" });
    }
});

app.get('/api/result', async (req, res) => {
    try {
        const counts = await VoteCount.findOne({});
        res.json(counts || { PTI: 0, PMLN: 0, Independent: 0 });
    } catch (err) {
        res.status(500).json({ error: "Result error" });
    }
});





app.get('/api/timer', async (req, res) => {
    try {
        let timer = await Timer.findOne({});
      
        if (!timer) {
            const initialExpiry = new Date(Date.now() + 10 * 60000);
            timer = new Timer({ expiresAt: initialExpiry });
            await timer.save();
        }
        res.json({ expiresAt: timer.expiresAt });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch timer" });
    }
});


app.post('/api/timer/reset', async (req, res) => {
    try {
        const durationMinutes = req.body.durationMinutes || 10;
        const newExpiresAt = new Date(Date.now() + durationMinutes * 60000);

      
        const updatedTimer = await Timer.findOneAndUpdate(
            {}, 
            { expiresAt: newExpiresAt }, 
            { new: true, upsert: true }
        );

        res.json({ message: 'Timer restarted successfully!', expiresAt: updatedTimer.expiresAt });
    } catch (err) {
        res.status(500).json({ error: "Failed to reset timer" });
    }
});

module.exports = app;