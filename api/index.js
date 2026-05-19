const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://root:root@cluster0.mongodb.net/voting_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Successfully connected to MongoDB Cloud Cluster."))
    .catch(err => console.error("MongoDB connection error:", err));


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hasVoted: { type: Boolean, default: false } // Stops users from duplicate voting
});


const tallySchema = new mongoose.Schema({
    PTI: { type: Number, default: 0 },
    PMLN: { type: Number, default: 0 },
    Independent: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Tally = mongoose.models.Tally || mongoose.model('Tally', tallySchema);


// Register a new voter account
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

        res.json({ success: true, username: user.username, hasVoted: user.hasVoted });
    } catch (err) {
        res.status(500).json({ error: "Login error." });
    }
});


app.post('/api/vote', async (req, res) => {
    try {
        const { username, candidate } = req.body;

        if (!username || !candidate) {
            return res.status(400).json({ error: "Missing profile context or candidate selection." });
        }

       
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found. Please log in again." });
        }

        
        if (user.hasVoted) {
            return res.status(400).json({ error: "Security Restriction: You have already cast your ballot!" });
        }

        
        await Tally.findOneAndUpdate(
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


app.get('/api/result', async (req, res) => {
    try {
        const counts = await Tally.findOne({});
        res.json(counts || { PTI: 0, PMLN: 0, Independent: 0 });
    } catch (err) {
        res.status(500).json({ error: "Failed to grab live results." });
    }
});

module.exports = app;