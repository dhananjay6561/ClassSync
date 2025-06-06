const mongoose = require('mongoose');

const connectToMongoDB = async () => {
  if (process.env.NODE_ENV === 'test') return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;



// This module exports a function to connect to MongoDB using Mongoose.
// It handles connection errors and logs the status of the connection.