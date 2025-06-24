// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('AutoSubstitute API running');
});

// Public Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const schoolRoutes = require('./routes/schoolRoutes');
app.use('/api/schools', schoolRoutes);




// Auth middleware
const auth = require('./middlewares/authMiddleware');
app.use(auth);

// School Context Middleware
const schoolContext = require('./middlewares/schoolContext');
app.use(schoolContext);

// Protected Routes
const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedules', scheduleRoutes);

const substitutionRoutes = require('./routes/substitutionRoutes');
app.use('/api/substitutions', substitutionRoutes);

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const conflictRoutes = require('./routes/conflictRoutes');
app.use('/api/conflicts', conflictRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

module.exports = app;
