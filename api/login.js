const { connectDB, User } = require('./db.js'); // Added .js

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    return res.status(200).json({ username: user.username, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server login error' });
  }
};