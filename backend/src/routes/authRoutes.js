const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
// This code defines the authentication routes for user registration and login.
// It imports the necessary modules, sets up the routes, and exports the router for use in the main application file.
// The '/register' route handles user registration, while the '/login' route handles user login.
// The `register` and `login` functions are imported from the `authController` module, which contains the logic for handling these requests.
// The router is then exported so it can be used in the main application file to handle authentication-related requests.
// This code sets up the authentication routes for an Express application.