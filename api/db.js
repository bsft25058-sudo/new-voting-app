const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI missing from environment variables');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Simple User Schema definition
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = { connectDB, User };