const express = require('express');
const router = express.Router();
const { applyLeave, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const attachSchoolId = require('../middlewares/attachSchoolId');


// Teacher applies for leave
router.post('/apply', auth, attachSchoolId, permit('teacher'), applyLeave);

// Admin views all leave requests for their school
router.get('/', auth, attachSchoolId, permit('admin'), getAllLeaves);

// Admin approves or rejects leave request
router.patch('/:leaveId/status', auth, attachSchoolId, permit('admin'), updateLeaveStatus);


module.exports = router;
// This code defines the routes for managing leave requests in an Express application.
// It imports necessary modules and middleware, sets up routes for applying for leave, viewing all leave requests, and updating the status of a leave request.
// The `applyLeave` route allows teachers to submit leave requests, while the `getAllLeaves` route allows admins to view all leave requests for their school.
// The `updateLeaveStatus` route allows admins to approve or reject leave requests.

// The `auth` middleware ensures that the user is authenticated, and the `permit` middleware restricts access based on user roles (teacher or admin).
// The routes are defined using Express's router, which allows for modular route handling.
// The router is then exported so it can be used in the main application file to handle leave-related requests.
// This code sets up the leave management routes for an Express application, allowing teachers to apply for leave and admins to manage leave requests.
// The routes are structured to ensure that only authorized users can access specific functionalities, enhancing security and role-based access control in the application.