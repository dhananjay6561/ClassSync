const User = require('../models/User');

const schoolContextInjector = async (req, res, next) => {
  try {
    if (!req.user) return next();

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.schoolId = user.schoolId; // now available in all routes
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error injecting school context' });
  }
};

module.exports = schoolContextInjector;
