const { connectDB, User } = require('./db.js'); // Added .js
const mongoose = require('mongoose');

// Define a simple schema to keep track of the vote count totals
const VoteCountSchema = new mongoose.Schema({
  candidate: { type: String, required: true, unique: true },
  votes: { type: Number, default: 0 }
});
const VoteCount = mongoose.models.VoteCount || mongoose.model('VoteCount', VoteCountSchema);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { candidate } = req.body;

    if (!candidate) {
      return res.status(400).json({ error: 'Candidate selection is required.' });
    }

    // Increment the aggregate scoreboard total for the chosen candidate
    await VoteCount.findOneAndUpdate(
      { candidate: candidate },
      { $inc: { votes: 1 } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Ballot successfully counted!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server processing error' });
  }
};