require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Basic root route
app.get('/', (req, res) => {
  res.send('AutoSubstitute API running');
});

// Public Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const schoolRoutes = require('./routes/schoolRoutes');
app.use('/api/schools', schoolRoutes);

// Auth middleware – this must come BEFORE schoolContext
const auth = require('./middlewares/authMiddleware');
app.use(auth);

// School Context Middleware – needs req.user
const schoolContext = require('./middlewares/schoolContext');
app.use(schoolContext);

// Protected Routes – now school-aware
const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedules', scheduleRoutes);

const substitutionRoutes = require('./routes/substitutionRoutes');
app.use('/api/substitutions', substitutionRoutes);

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
