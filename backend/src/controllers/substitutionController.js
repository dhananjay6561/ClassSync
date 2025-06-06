const Substitution = require('../models/Substitution');
const ScheduleSlot = require('../models/ScheduleSlot');
const User = require('../models/User');

// Teacher: Get their substitutions
exports.getMySubstitutions = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.schoolId;

    const subs = await Substitution.find({
      substituteTeacherId: teacherId,
      schoolId,
    })
      .populate('originalTeacherId', 'name email')
      .populate({
        path: 'scheduleSlotId',
        select: 'weekday periodIndex subject classSection',
      })
      .sort({ assignedAt: -1 });

    res.json(subs);
  } catch (err) {
    console.error('getMySubstitutions error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Get all substitutions in their school
exports.getAllSubstitutions = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    const subs = await Substitution.find({ schoolId })
      .populate('originalTeacherId', 'name email')
      .populate('substituteTeacherId', 'name email')
      .populate({
        path: 'scheduleSlotId',
        select: 'weekday periodIndex subject classSection',
      })
      .sort({ assignedAt: -1 });

    res.json(subs);
  } catch (err) {
    console.error('getAllSubstitutions error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//This code defines two functions for managing teacher substitutions in a school system.
// The `getMySubstitutions` function retrieves all substitutions for the currently logged-in teacher.
// It populates the original teacher's details and the schedule slot information, sorting the results by the assignment date.
// The `getAllSubstitutions` function retrieves all substitutions in the school, populating both the original and substitute teacher details,
// as well as the schedule slot information. It also sorts the results by the assignment date.
// The functions handle errors and respond with appropriate status codes and messages.
// The `getMySubstitutions` function retrieves a teacher's substitutions, populating original teacher and schedule slot details.
// The `getAllSubstitutions` function retrieves all substitutions in a school, populating both original and substitute teacher details.
// The functions use Mongoose to query the `Substitution` model and populate related fields.