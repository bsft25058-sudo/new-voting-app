const { connectDB } = require('./db');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Fetch the active table calculations
    const VoteCount = mongoose.models.VoteCount || mongoose.model('VoteCount', new mongoose.Schema({
      candidate: String,
      votes: Number
    }));

    const rawResults = await VoteCount.find({});
    
    // Format the database array into a clean frontend object structure
    const formattedStats = { PTI: 0, PMLN: 0, Independent: 0 };
    rawResults.forEach(item => {
      if (formattedStats[item.candidate] !== undefined) {
        formattedStats[item.candidate] = item.votes;
      }
    });

    return res.status(200).json(formattedStats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to stream public totals.' });
  }
};