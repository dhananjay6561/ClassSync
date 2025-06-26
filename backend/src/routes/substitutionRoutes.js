const express = require('express');
const router = express.Router();
const {
  getMySubstitutions,
  getAllSubstitutions,
  getSubstitutionHistory,
  generateSubstitutions 
} = require('../controllers/substitutionController');
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');

// Teacher views their own substitutions
router.get('/mine', auth, permit('teacher'), getMySubstitutions);

// Admin views all substitutions for the school
router.get('/all', auth, permit('admin'), getAllSubstitutions);

// Admin views full substitution history with optional filters
router.get('/history', auth, permit('admin'), getSubstitutionHistory);

router.post('/generate', auth, permit('admin'), generateSubstitutions);

module.exports = router;

// This code defines the routes for managing teacher substitutions in a school system.
// It imports necessary modules and middleware, sets up routes for teachers to view their own substitutions and admins to view all substitutions in the school,
// and exports the router for use in the main application.
// The `getMySubstitutions` route allows teachers to retrieve their own substitution records,
// while the `getAllSubstitutions` route allows admins to retrieve all substitution records in the school.
// The `auth` middleware ensures that the user is authenticated, and the `permit` middleware restricts access based on user roles (teacher or admin).
// The routes are defined using Express's router, which allows for modular route handling.
// The router is then exported so it can be used in the main application file to handle substitution-related requests.
// This code sets up the substitution management routes for an Express application, allowing teachers to view their own substitutions and admins to manage all substitutions.
// The routes are structured to ensure that only authorized users can access specific functionalities, enhancing security and role-based access control in the application.