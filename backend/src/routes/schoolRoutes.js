const express = require('express');
const router = express.Router();
const { createSchool, updateTimetableConfig } = require('../controllers/schoolController');
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');

// Only admins can create/update schools
router.post('/', auth, permit('admin'), createSchool);
router.put('/:schoolId/timetable', auth, permit('admin'), updateTimetableConfig);

module.exports = router;
// This code defines the routes for managing schools in an educational application.
// It uses Express to create a router and sets up two routes:
// 1. `POST /` - This route allows authenticated users with the 'admin' role to create a new school.    
// 2. `PUT /:schoolId/timetable` - This route allows authenticated users with the 'admin' role to update the timetable configuration of an existing school identified by its ID.
// The `auth` middleware checks if the user is authenticated, and the `permit` middleware checks if the user has the required role to access these routes.
// The `createSchool` and `updateTimetableConfig` functions are imported from the `schoolController` module, which contains the logic for handling these requests.
// The router is then exported so it can be used in the main application file to handle school-related requests.
// This code defines the routes for managing schools in an educational application.
// It uses Express to create a router and sets up two routes: