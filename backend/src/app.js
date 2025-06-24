// src/app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB();

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



module.exports = app;
