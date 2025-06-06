const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
// This module exports a function to connect to MongoDB using Mongoose.
// It handles connection errors and logs the status of the connection.