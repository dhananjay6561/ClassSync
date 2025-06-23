const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const { getScheduleGrid } = require('../controllers/scheduleController');

const {
  assignSlot,
  editSlot,
  deleteSlot,
  getTeacherSchedule,
  getMySchedule,
} = require('../controllers/scheduleController');

// Authenticated routes only
router.use(auth);

// Admin-only routes
router.post('/assign', permit('admin'), assignSlot);              // Create new slot
router.put('/:slotId', permit('admin'), editSlot);               // Edit slot
router.delete('/:slotId', permit('admin'), deleteSlot);          // Delete slot
router.get('/teacher/:teacherId', permit('admin'), getTeacherSchedule); // View schedule for a teacher

// Teacher-only route
router.get('/mine', permit('teacher'), getMySchedule);           // View own schedule

// Teacher's own grid
router.get('/mine/grid', permit('teacher'), getScheduleGrid);

// Admin viewing any teacher’s grid
router.get('/teacher/:teacherId/grid', permit('admin'), getScheduleGrid);
module.exports = router;

//This code defines the schedule routes for the AutoSubstitute application.
// It includes routes for assigning, editing, and deleting schedule slots,
// as well as viewing schedules for teachers and admins.
// The routes are protected by authentication and authorization middleware,
// ensuring that only authorized users can access them.
// The `permit` middleware is used to restrict access based on user roles (admin or teacher).
// The routes are organized using Express.js, and the router is exported for use in the main application file.
// The `assignSlot`, `editSlot`, `deleteSlot`, `getTeacherSchedule`, and `getMySchedule` functions are imported from the `scheduleController` module,
// which contains the logic for handling these operations.
// The routes are designed to work within the context of a school, ensuring that all operations are performed with the correct school context.
// The `auth` middleware is used to ensure that only authenticated users can access these routes.
// The `permit` middleware is used to restrict access based on user roles, allowing only admins to assign, edit, or delete slots,
// while teachers can only view their own schedules.
// This modular approach allows for better organization and maintainability of the codebase,
// making it easier to manage schedule-related operations in the AutoSubstitute application.
// The routes are structured to provide clear and consistent endpoints for managing schedules,
// making it easier for frontend applications to interact with the backend.
// The `getTeacherSchedule` and `getMySchedule` functions allow teachers to view their schedules,
// while the admin can view any teacher's schedule, providing flexibility in managing school schedules.
// The use of async/await syntax ensures that the code is clean and easy to read,
// while also handling errors gracefully with try/catch blocks.
// The router is designed to be used in a Node.js/Express application, with middleware to handle authentication and authorization.
// The routes are structured to provide clear and consistent responses, making it easier for frontend applications to consume the API.
// The module exports the router, which can be imported and used in the main application file to set up the schedule-related endpoints.
// This modular approach allows for better organization and maintainability of the codebase,
// making it easier to manage schedule-related operations in the AutoSubstitute application.
// The routes are designed to work within the context of a school, ensuring that all operations are performed with the correct school context.
// The `auth` middleware is used to ensure that only authenticated users can access these routes.
// The `permit` middleware is used to restrict access based on user roles,
// allowing only admins to assign, edit, or delete slots,
// while teachers can only view their own schedules.