const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register new admin and school
exports.register = async (req, res) => {
  try {
    const { schoolName, name, email, password } = req.body;

    if (!schoolName || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if any school exists
    const existingSchool = await School.findOne();
    if (existingSchool) {
      return res.status(400).json({ message: 'A school already exists. Please login or contact the admin.' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Create school
    const school = new School({ name: schoolName });
    await school.save();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      schoolId: school._id,
    });
    await user.save();

    // Create JWT token
    const payload = { userId: user._id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT token
    const payload = { userId: user._id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//This code defines the authentication controller for user registration and login in an Express application.
// It includes functions to register a new user and log in an existing user, handling password hashing and JWT token generation.
// The `register` function checks if a user already exists, hashes the password, creates a new user, and returns a JWT token.
// The `login` function verifies the user's credentials, checks the password, and returns a JWT token if successful.
// The controller uses Mongoose for database operations, bcrypt for password hashing, and jsonwebtoken for token generation.
// The `register` function handles user registration, including password hashing and JWT token creation.
// The `login` function handles user login, verifying credentials and generating a JWT token.
// The controller responds with appropriate status codes and messages for success and error cases.