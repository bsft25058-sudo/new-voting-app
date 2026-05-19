const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(express.json());

app.use(cors()); 


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TaimoorShahid:taimoor2007@online-voting.system.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("MongoDB Connected Successfully!"))
.catch((err) => console.error("MongoDB Connection Error:", err));
// ==========================================
// 3. DATABASE SCHEMA & MODEL
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

// ==========================================
// 4. API ROUTES (Endpoints)
// ==========================================

// Route to submit a new vote
app.post('/api/vote', async (req, res) => {
    try {
        const { candidate } = req.body;
        if (!candidate) {
            return res.status(400).json({ success: false, message: 'Candidate selection required' });
        }
        
        const newVote = new Vote({ candidate });
        await newVote.save();
        res.status(201).json({ success: true, message: 'Vote counted in MongoDB!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route to fetch and calculate total results
app.get('/api/results', async (req, res) => {
    try {
        const results = await Vote.aggregate([
            { $group: { _id: "$candidate", count: { $sum: 1 } } }
        ]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Test route to ensure server is live
app.get('/', (req, res) => {
    res.send('Voting System Backend Server is Running Live!');
});

// ==========================================
// 5. START SERVER
// ==========================================
// Uses the live hosting port or defaults to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});