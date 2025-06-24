const LeaveRequest = require('../models/LeaveRequest');
const Substitution = require('../models/Substitution');
const ScheduleSlot = require('../models/ScheduleSlot');
const User = require('../models/User');

// Admin dashboard summary
exports.getAdminDashboard = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    const [totalTeachers, totalAdmins] = await Promise.all([
      User.countDocuments({ schoolId, role: 'teacher' }),
      User.countDocuments({ schoolId, role: 'admin' }),
    ]);

    const [pendingLeaves, approvedLeaves] = await Promise.all([
      LeaveRequest.countDocuments({ schoolId, status: 'pending' }),
      LeaveRequest.countDocuments({ schoolId, status: 'approved' }),
    ]);

    const totalSubs = await Substitution.countDocuments({});

    const scheduleLoad = await ScheduleSlot.aggregate([
      { $match: { schoolId } },
      { $group: {
          _id: '$teacherId',
          count: { $sum: 1 }
        }
      }
    ]);

    const topLoaded = scheduleLoad.sort((a, b) => b.count - a.count).slice(0, 3);

    res.json({
      summary: {
        totalTeachers,
        totalAdmins,
        pendingLeaves,
        approvedLeaves,
        totalSubstitutions: totalSubs,
        mostLoadedTeachers: topLoaded,
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Dashboard data fetch failed.' });
  }
};

//This module exports the getAdminDashboard function which retrieves various statistics for the admin dashboard, including counts of teachers, admins, leave requests, and substitutions, as well as the most loaded teachers based on their schedule slots. It uses Mongoose models to query the database and aggregate data as needed. The results are returned in a structured JSON response.
// The function handles errors gracefully and logs them for debugging purposes.
// It is designed to be used in an Express.js application, where it can be called as part of a route handler for the admin dashboard endpoint.
// The function uses async/await for asynchronous operations, ensuring that the code is clean and easy to read.
// It also uses Promise.all to run multiple database queries in parallel, improving performance by reducing the overall execution time.
// The aggregation pipeline is used to calculate the number of schedule slots per teacher, allowing the application to identify the most loaded teachers based on their schedule slots.
// The response includes a summary object that contains all the relevant statistics, making it easy for the frontend to display the data in a user-friendly manner.
// The function is part of a larger application that manages school operations, including leave requests and teacher schedules.
// It is intended to be used by school administrators to monitor and manage teacher workloads, leave requests, and overall school operations efficiently.
// The function is designed to be modular and reusable, allowing for easy integration into different parts of the application or future enhancements.
// It follows best practices for error handling and data retrieval in a Node.js environment, ensuring reliability and maintainability of the codebase.
// The function can be extended in the future to include more statistics or features as needed, such as filtering by date ranges or specific teachers.
// It is a crucial part of the backend logic for the school management system, providing essential insights into teacher workloads and leave management.