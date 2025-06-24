const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const attachSchoolId = require('../middlewares/attachSchoolId');
const { getAllTeachers, deleteTeacher, updateTeacher, createTeacher, getTeacherDetails } = require('../controllers/adminController');

// All routes in this file are protected and for admins only
router.use(auth, permit('admin'), attachSchoolId);

// @route   GET /api/admin/teachers
// @desc    Get a list of all teachers
// @access  Admin
router.get('/teachers', getAllTeachers);

// @route   GET /api/admin/teachers/:id
// @desc    Get a single teacher's details
// @access  Admin
router.get('/teachers/:id', getTeacherDetails);

// @route   POST /api/admin/teachers
// @desc    Create a new teacher
// @access  Admin
router.post('/teachers', createTeacher);

// @route   DELETE /api/admin/teachers/:id
// @desc    Delete a teacher
// @access  Admin
router.delete('/teachers/:id', deleteTeacher);

// @route   PUT /api/admin/teachers/:id
// @desc    Update a teacher's details
// @access  Admin
router.put('/teachers/:id', updateTeacher);

module.exports = router; 