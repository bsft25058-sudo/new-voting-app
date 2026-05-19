const { connectDB, User } = require('./db.js'); 

module.exports = async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Save user directly to the database
    const newUser = new User({ username, password });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server registration error' });
  }
};