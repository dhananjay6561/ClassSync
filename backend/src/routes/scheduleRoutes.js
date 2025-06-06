const express = require('express');
const router = express.Router();
const { setSchedule, getTeacherSchedule } = require('../controllers/scheduleController');
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');

router.post('/set', auth, permit('admin'), setSchedule);
router.get('/teacher/:teacherId', auth, permit('admin'), getTeacherSchedule);
router.get('/my-schedule', auth, permit('teacher'), getTeacherSchedule); // teacher views their own

module.exports = router;


// This code defines the routes for managing school schedules in an Express application.
// It imports necessary modules and middleware, sets up routes for setting a schedule and retrieving a teacher's schedule,
// and exports the router for use in the main application.
// The `setSchedule` route allows an admin to create or update schedule slots for teachers,
// while the `getTeacherSchedule` route allows both admins and teachers to retrieve schedules.
// The `my-schedule` route allows teachers to view their own schedules.
// The `auth` middleware ensures that the user is authenticated, and the `permit` middleware restricts access based on user roles (admin or teacher).
// The routes are defined using Express's router, which allows for modular route handling.

