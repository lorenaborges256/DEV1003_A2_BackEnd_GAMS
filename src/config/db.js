/* eslint-disable linebreak-style */
// Connect to the database
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('DB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
