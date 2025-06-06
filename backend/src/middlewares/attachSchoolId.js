const User = require('../models/User');

const attachSchoolId = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      console.error('attachSchoolId error: User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.schoolId) {
      console.error('attachSchoolId error: schoolId missing in user');
      return res.status(400).json({ message: 'School ID not found for user' });
    }

    req.schoolId = user.schoolId.toString();
    next();
  } catch (err) {
    console.error('attachSchoolId error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = attachSchoolId;



// This middleware retrieves the user's school ID from the database based on the authenticated user's ID.
// It attaches the school ID to the request object for use in subsequent route handlers.
// If the user is not found, it responds with a 401 Unauthorized status.
// If there's a server error, it responds with a 500 status and logs the error.
// This middleware is used to ensure that the school ID is available in the request context for routes that require it.