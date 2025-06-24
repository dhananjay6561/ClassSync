const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const attachSchoolId = require('../middlewares/attachSchoolId');

// Teacher applies for leave
router.post('/apply', auth, attachSchoolId, permit('teacher'), applyLeave);

// Teacher gets their own leave history
router.get('/my-leaves', auth, permit('teacher'), getMyLeaves);

// Admin views all leave requests for their school
router.get('/', auth, attachSchoolId, permit('admin'), getAllLeaves);

// Admin fetches only pending leave requests
router.get('/pending', auth, attachSchoolId, permit('admin'), getPendingLeaves);

// ✅ Admin approves leave request
router.put('/:leaveId/approve', auth, attachSchoolId, permit('admin'), (req, res, next) => {
  req.body.status = 'approved';
  next();
}, updateLeaveStatus);

// ✅ Admin rejects leave request
router.put('/:leaveId/reject', auth, attachSchoolId, permit('admin'), (req, res, next) => {
  req.body.status = 'rejected';
  next();
}, updateLeaveStatus);

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