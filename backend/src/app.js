require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

// Middleware to parse JSON body
app.use(express.json());



// Basic root route
app.get('/', (req, res) => {
  res.send('AutoSubstitute API running');
});



const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const schoolRoutes = require('./routes/schoolRoutes');
app.use('/api/schools', schoolRoutes);

const schoolContext = require('./middlewares/schoolContext'); 
app.use(schoolContext);

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedules', scheduleRoutes);





// Define PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// This code initializes an Express application, connects to a MongoDB database using Mongoose, and sets up a basic route.
// It listens on a specified port (defaulting to 5000) and logs a message when the server is running.


